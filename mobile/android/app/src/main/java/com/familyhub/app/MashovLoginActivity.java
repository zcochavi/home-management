package com.familyhub.app;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Opens Mashov's real website so the parent logs in exactly as in a browser
 * (username + password, or the Ministry of Education login). A small script
 * watches the site's own API traffic and reports:
 *  - the kids, from the login response (accessToken.children), or at least their
 *    ids from the site's /api/students/{childGuid}/... requests;
 *  - the session's CSRF token, which Mashov's API wants in an X-Csrf-Token header.
 * The session cookies stay in the WebView cookie jar, which
 * MashovConnectPlugin.get() reuses to sync homework from the phone later.
 */
public class MashovLoginActivity extends AppCompatActivity {
    public static final String EXTRA_CHILDREN = "children";
    public static final String EXTRA_CSRF = "csrf";
    static final String MASHOV_ORIGIN = "https://web.mashov.info";
    static final String MASHOV_URL = MASHOV_ORIGIN + "/students/login";

    private static final String CAPTURE_JS =
        "(function(){if(window.__fhMashov)return;window.__fhMashov=1;" +
        "var CH=/\\/api\\/students\\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\\//i;" +
        "function csrf(v){if(v)try{FHMashov.onCsrf(String(v));}catch(e){}}" +
        "function child(o){try{FHMashov.onChild(JSON.stringify(o));}catch(e){}}" +
        "function seen(u,j){u=String(u||'');var m=CH.exec(u);if(m)child({childGuid:m[1]});" +
        "if(u.indexOf('/api/')<0||!j)return;try{if(typeof j==='string')j=JSON.parse(j);}catch(e){return;}" +
        "var a=j&&j.accessToken;if(!a||!Array.isArray(a.children))return;" +
        "var sn=(a.schoolOptions&&a.schoolOptions.schoolName)||(a.schoolSettings&&a.schoolSettings.schoolName)||'';" +
        "a.children.forEach(function(c){if(c&&c.childGuid)child({childGuid:c.childGuid,privateName:c.privateName||'',familyName:c.familyName||''," +
        "classCode:c.classCode||'',classNum:c.classNum==null?'':String(c.classNum),schoolName:sn});});}" +
        "var oo=XMLHttpRequest.prototype.open,os=XMLHttpRequest.prototype.send,oh=XMLHttpRequest.prototype.setRequestHeader;" +
        "XMLHttpRequest.prototype.open=function(m,u){this.__fhUrl=String(u||'');return oo.apply(this,arguments);};" +
        "XMLHttpRequest.prototype.setRequestHeader=function(n,v){if(String(n).toLowerCase()==='x-csrf-token')csrf(v);return oh.apply(this,arguments);};" +
        "XMLHttpRequest.prototype.send=function(b){var x=this;if((x.__fhUrl||'').indexOf('/api/')>=0){x.addEventListener('load',function(){" +
        "if(x.status!==200)return;try{csrf(x.getResponseHeader('x-csrf-token'));}catch(e){}" +
        "var r=null;try{r=(x.responseType===''||x.responseType==='text')?x.responseText:x.response;}catch(e){}seen(x.__fhUrl,r);});}" +
        "return os.apply(this,arguments);};" +
        "var of=window.fetch;if(of){window.fetch=function(u,o){var s=(typeof u==='string'?u:(u&&u.url)||'')+'';" +
        "try{var h=o&&o.headers;if(h){if(typeof h.get==='function')csrf(h.get('x-csrf-token'));else for(var k in h)if(k.toLowerCase()==='x-csrf-token')csrf(h[k]);}}catch(e){}" +
        "return of.apply(this,arguments).then(function(r){if(s.indexOf('/api/')>=0&&r.status===200){try{csrf(r.headers.get('x-csrf-token'));}catch(e){}" +
        "r.clone().text().then(function(t){seen(s,t);}).catch(function(){});}return r;});};}" +
        "})();";

    private final Map<String, JSONObject> children = new LinkedHashMap<>();
    private String csrf = "";
    // Closes by itself once the login response listed the kids and the CSRF token is known —
    // that's all the app needs; the parent doesn't have to tap 'Done'
    private boolean sawKidList = false;
    private boolean closing = false;
    private WebView webView;
    private TextView statusView;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.WHITE);

        LinearLayout bar = new LinearLayout(this);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        bar.setGravity(Gravity.CENTER_VERTICAL);
        bar.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        bar.setBackgroundColor(Color.parseColor("#6C80E8"));
        int pad = dp(12);
        bar.setPadding(pad, dp(10), pad, dp(10));

        statusView = new TextView(this);
        statusView.setTextColor(Color.WHITE);
        statusView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        statusView.setText("היכנסו למשו״ב עם פרטי ההורה — הילדים יזוהו אוטומטית");
        bar.addView(statusView, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));

        Button done = new Button(this);
        done.setText("סיום");
        done.setAllCaps(false);
        done.setTypeface(Typeface.DEFAULT_BOLD);
        done.setOnClickListener(v -> finishWithResult());
        bar.addView(done, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT));

        root.addView(bar, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));

        webView = new WebView(this);
        root.addView(webView, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f));
        setContentView(root);

        // Android 15+ draws apps edge to edge: keep the bar below the phone's status bar (time,
        // battery) — its colour still fills the space behind it — and the page above the
        // navigation bar and the keyboard.
        WindowCompat.getInsetsController(getWindow(), root).setAppearanceLightStatusBars(false); // white icons on the blue bar
        final int barTop = bar.getPaddingTop();
        ViewCompat.setOnApplyWindowInsetsListener(root, (v, insets) -> {
            Insets sys = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            Insets ime = insets.getInsets(WindowInsetsCompat.Type.ime());
            bar.setPadding(bar.getPaddingLeft(), barTop + sys.top, bar.getPaddingRight(), bar.getPaddingBottom());
            v.setPadding(sys.left, 0, sys.right, Math.max(sys.bottom, ime.bottom));
            return WindowInsetsCompat.CONSUMED;
        });

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

        webView.addJavascriptInterface(new Bridge(), "FHMashov");
        boolean docStart = WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT);
        if (docStart) {
            WebViewCompat.addDocumentStartJavaScript(webView, CAPTURE_JS, Collections.singleton(MASHOV_ORIGIN));
        }
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                if (!docStart && url != null && url.startsWith(MASHOV_ORIGIN)) view.evaluateJavascript(CAPTURE_JS, null);
                CookieManager.getInstance().flush();
            }
        });
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView.canGoBack()) webView.goBack();
                else finishWithResult();
            }
        });
        webView.loadUrl(MASHOV_URL);
    }

    private class Bridge {
        @JavascriptInterface
        public void onChild(String json) {
            try {
                JSONObject c = new JSONObject(json);
                String guid = c.optString("childGuid", "").toLowerCase();
                if (guid.length() != 36) return;
                c.put("childGuid", guid);
                runOnUiThread(() -> {
                    JSONObject prev = children.get(guid);
                    // An id seen in a URL must not replace the named entry from the login response.
                    if (prev == null || !c.optString("privateName", "").isEmpty()) children.put(guid, c);
                    if (c.has("privateName")) sawKidList = true; // from the login response's list
                    if (!closing) statusView.setText("✓ זוהו " + children.size() + " ילדים — לחצו 'סיום'");
                    maybeAutoClose();
                });
            } catch (Exception ignored) {}
        }

        @JavascriptInterface
        public void onCsrf(String token) {
            if (token == null || token.isEmpty() || token.length() > 500) return;
            runOnUiThread(() -> { csrf = token; maybeAutoClose(); });
        }
    }

    private void maybeAutoClose() {
        if (closing || !sawKidList || children.isEmpty() || csrf.isEmpty()) return;
        closing = true;
        // A moment for the rest of the list (reported one child at a time) to arrive
        statusView.postDelayed(() -> {
            statusView.setText("✓ זוהו " + children.size() + " ילדים — מסנכרן…");
            statusView.postDelayed(this::finishWithResult, 800);
        }, 400);
    }

    private void finishWithResult() {
        if (isFinishing()) return;
        CookieManager.getInstance().flush();
        JSONArray arr = new JSONArray();
        for (JSONObject c : children.values()) arr.put(c);
        Intent data = new Intent();
        data.putExtra(EXTRA_CHILDREN, arr.toString());
        data.putExtra(EXTRA_CSRF, csrf);
        setResult(RESULT_OK, data);
        finish();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.removeJavascriptInterface("FHMashov");
            webView.destroy();
        }
        super.onDestroy();
    }

    private int dp(int v) {
        return Math.round(TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, getResources().getDisplayMetrics()));
    }
}
