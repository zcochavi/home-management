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
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Opens Webtop's real website so the parent logs in exactly as they would in a
 * browser (password, email code, Ministry of Education login). A small script
 * watches the site's own homework requests and, for each one that succeeds,
 * records that kid's request parameters — the same thing the desktop extension
 * does. The session cookies stay in the WebView cookie jar, which
 * WebtopConnectPlugin.post() reuses to sync homework from the phone later.
 */
public class WebtopLoginActivity extends AppCompatActivity {
    public static final String EXTRA_STUDENTS = "students";
    public static final String EXTRA_TRACE = "trace";
    private static final int TRACE_MAX = 400;
    static final String WEBTOP_URL = "https://webtop.smartschool.co.il/";

    // Injected into Webtop's pages. Reports the body of every successful
    // GetPupilLessonsAndHomework request (that kid's params) to FHWebtop.
    private static final String CAPTURE_JS =
        "(function(){if(window.__fhWebtop)return;window.__fhWebtop=1;" +
        "var HW='GetPupilLessonsAndHomework';" +
        "function report(b){try{var p=JSON.parse(b||'');if(p&&p.studentID&&p.classCode!=null)FHWebtop.onStudent(JSON.stringify(p));}catch(e){}}" +
        "var of=window.fetch;if(of){window.fetch=function(u,o){var s=(typeof u==='string'?u:(u&&u.url)||'')+'';" +
        "return of.apply(this,arguments).then(function(r){if(s.indexOf(HW)>=0&&r.status===200&&o&&typeof o.body==='string')report(o.body);return r;});};}" +
        "var oo=XMLHttpRequest.prototype.open,os=XMLHttpRequest.prototype.send;" +
        "XMLHttpRequest.prototype.open=function(m,u){this.__fhUrl=String(u||'');return oo.apply(this,arguments);};" +
        "XMLHttpRequest.prototype.send=function(b){var x=this;if((x.__fhUrl||'').indexOf(HW)>=0){x.addEventListener('load',function(){if(x.status===200&&typeof b==='string')report(b);});}" +
        "return os.apply(this,arguments);};})();";

    private final Map<String, JSONObject> students = new LinkedHashMap<>();
    // Diagnostic recording of Webtop's own API requests (masked; see assets/fh/webtop-trace.js)
    private final JSONArray trace = new JSONArray();
    private String traceJs = null;
    // Closes the screen once Webtop lists the parent's children (assets/fh/webtop-login-watch.js)
    private String watchJs = null;
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

        // Top bar: instructions / progress, and a Done button.
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
        statusView.setText("היכנסו ל-Webtop — הילדים יימצאו אוטומטית");
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

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

        webView.addJavascriptInterface(new Bridge(), "FHWebtop");
        traceJs = readAsset("fh/webtop-trace.js");
        watchJs = readAsset("fh/webtop-login-watch.js");
        boolean docStart = WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT);
        if (docStart) {
            WebViewCompat.addDocumentStartJavaScript(webView, CAPTURE_JS,
                Collections.singleton("https://webtop.smartschool.co.il"));
            if (traceJs != null) WebViewCompat.addDocumentStartJavaScript(webView, traceJs,
                Collections.singleton("https://webtop.smartschool.co.il"));
            if (watchJs != null) WebViewCompat.addDocumentStartJavaScript(webView, watchJs,
                Collections.singleton("https://webtop.smartschool.co.il"));
        }
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                // Fallback for older WebViews without document-start scripts.
                if (!docStart && url != null && url.startsWith(WEBTOP_URL)) {
                    view.evaluateJavascript(CAPTURE_JS, null);
                    if (traceJs != null) view.evaluateJavascript(traceJs, null);
                    if (watchJs != null) view.evaluateJavascript(watchJs, null);
                }
                CookieManager.getInstance().flush();
            }
        });
        // Back: navigate within Webtop first; at the start, close with what we found.
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView.canGoBack()) webView.goBack();
                else finishWithResult();
            }
        });
        webView.loadUrl(WEBTOP_URL);
    }

    private String readAsset(String path) {
        try (java.io.InputStream in = getAssets().open(path)) {
            java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
            byte[] buf = new byte[4096]; int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            return out.toString("UTF-8");
        } catch (Exception e) { return null; }
    }

    private class Bridge {
        // Logged in and Webtop listed the children: the app takes it from here
        @JavascriptInterface
        public void onKidsListed(int count) {
            runOnUiThread(() -> {
                if (closing) return;
                closing = true;
                statusView.setText("✓ נמצאו " + count + " ילדים — מסנכרן…");
                statusView.postDelayed(WebtopLoginActivity.this::finishWithResult, 1200);
            });
        }

        @JavascriptInterface
        public void onTrace(String json) {
            try {
                JSONObject e = new JSONObject(json);
                runOnUiThread(() -> { if (trace.length() < TRACE_MAX) trace.put(e); });
            } catch (Exception ignored) {}
        }

        @JavascriptInterface
        public void onStudent(String json) {
            try {
                JSONObject p = new JSONObject(json);
                String key = p.optString("studentName", "") + "|" + p.opt("classCode");
                runOnUiThread(() -> {
                    students.put(key, p);
                    if (!closing) statusView.setText("✓ נמצאו " + students.size() + " ילדים — פתחו ילד/ה נוסף/ת או לחצו 'סיום'");
                });
            } catch (Exception ignored) {}
        }
    }

    private void finishWithResult() {
        if (isFinishing()) return;
        CookieManager.getInstance().flush();
        JSONArray arr = new JSONArray();
        for (JSONObject p : students.values()) arr.put(p);
        Intent data = new Intent();
        data.putExtra(EXTRA_STUDENTS, arr.toString());
        data.putExtra(EXTRA_TRACE, trace.toString());
        setResult(RESULT_OK, data);
        finish();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.removeJavascriptInterface("FHWebtop");
            webView.destroy();
        }
        super.onDestroy();
    }

    private int dp(int v) {
        return Math.round(TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, getResources().getDisplayMetrics()));
    }
}
