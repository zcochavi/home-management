package com.familyhub.app;

import android.content.Intent;
import android.webkit.CookieManager;
import android.webkit.WebSettings;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * Mashov connection for the FamilyHub Android app (the Mashov twin of
 * WebtopConnectPlugin):
 *  - open():  shows Mashov's real site (MashovLoginActivity) for the parent to
 *             log in; returns the kids and the session's CSRF token.
 *  - get():   GETs a Mashov API URL from the phone with that login's cookies and
 *             CSRF token. Only Mashov's API is allowed.
 *  - disconnect(): forgets the Mashov session on this device.
 */
@CapacitorPlugin(name = "MashovConnect")
public class MashovConnectPlugin extends Plugin {
    private static final String ORIGIN = MashovLoginActivity.MASHOV_ORIGIN;

    @PluginMethod
    public void open(PluginCall call) {
        Intent intent = new Intent(getContext(), MashovLoginActivity.class);
        startActivityForResult(call, intent, "onLoginResult");
    }

    @ActivityCallback
    private void onLoginResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        JSObject ret = new JSObject();
        Intent data = result.getData();
        try {
            String json = data != null ? data.getStringExtra(MashovLoginActivity.EXTRA_CHILDREN) : null;
            ret.put("children", new JSArray(json != null ? json : "[]"));
        } catch (Exception e) {
            ret.put("children", new JSArray());
        }
        String csrf = data != null ? data.getStringExtra(MashovLoginActivity.EXTRA_CSRF) : null;
        ret.put("csrf", csrf != null && !csrf.isEmpty() ? csrf : cookieCsrf());
        call.resolve(ret);
    }

    // Mashov keeps the CSRF token in a cookie as well; used when none was captured.
    private String cookieCsrf() {
        String cookies = CookieManager.getInstance().getCookie(ORIGIN);
        if (cookies == null) return "";
        for (String c : cookies.split(";")) {
            String[] kv = c.trim().split("=", 2);
            if (kv.length == 2 && (kv[0].equalsIgnoreCase("Csrf-Token") || kv[0].equalsIgnoreCase("XSRF-TOKEN"))) {
                try { return URLDecoder.decode(kv[1], "UTF-8"); } catch (Exception e) { return kv[1]; }
            }
        }
        return "";
    }

    @PluginMethod
    public void get(PluginCall call) {
        String url = call.getString("url", "");
        String csrfArg = call.getString("csrf", "");
        if (url == null || !url.startsWith(ORIGIN + "/api/")) {
            call.reject("Only Mashov API URLs are allowed");
            return;
        }
        new Thread(() -> {
            HttpURLConnection conn = null;
            try {
                CookieManager cm = CookieManager.getInstance();
                conn = (HttpURLConnection) new URL(url).openConnection();
                conn.setConnectTimeout(20000);
                conn.setReadTimeout(30000);
                conn.setRequestMethod("GET");
                conn.setRequestProperty("Accept", "application/json, text/plain, */*");
                conn.setRequestProperty("Referer", ORIGIN + "/students/main");
                conn.setRequestProperty("User-Agent", WebSettings.getDefaultUserAgent(getContext()));
                String csrf = csrfArg != null && !csrfArg.isEmpty() ? csrfArg : cookieCsrf();
                if (!csrf.isEmpty()) conn.setRequestProperty("X-Csrf-Token", csrf);
                String cookies = cm.getCookie(ORIGIN);
                if (cookies != null && !cookies.isEmpty()) conn.setRequestProperty("Cookie", cookies);

                int status = conn.getResponseCode();

                Map<String, List<String>> headers = conn.getHeaderFields();
                for (Map.Entry<String, List<String>> h : headers.entrySet()) {
                    if (h.getKey() != null && h.getKey().equalsIgnoreCase("Set-Cookie")) {
                        for (String c : h.getValue()) cm.setCookie(ORIGIN, c);
                    }
                }
                cm.flush();
                String newCsrf = conn.getHeaderField("x-csrf-token");

                InputStream is = status >= 400 ? conn.getErrorStream() : conn.getInputStream();
                String text = "";
                if (is != null) {
                    ByteArrayOutputStream buf = new ByteArrayOutputStream();
                    byte[] chunk = new byte[8192];
                    int n;
                    while ((n = is.read(chunk)) != -1) buf.write(chunk, 0, n);
                    is.close();
                    text = buf.toString(StandardCharsets.UTF_8.name());
                }
                JSObject ret = new JSObject();
                ret.put("status", status);
                ret.put("text", text);
                if (newCsrf != null && !newCsrf.isEmpty()) ret.put("csrf", newCsrf);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Mashov request failed: " + e.getMessage(), e);
            } finally {
                if (conn != null) conn.disconnect();
            }
        }).start();
    }

    @PluginMethod
    public void disconnect(PluginCall call) {
        CookieManager cm = CookieManager.getInstance();
        String cookies = cm.getCookie(ORIGIN);
        if (cookies != null) {
            for (String c : cookies.split(";")) {
                String name = c.split("=", 2)[0].trim();
                if (name.isEmpty()) continue;
                cm.setCookie(ORIGIN, name + "=; Max-Age=0; Path=/");
                cm.setCookie(ORIGIN, name + "=; Max-Age=0; Path=/; Domain=.mashov.info");
            }
        }
        cm.flush();
        call.resolve();
    }
}
