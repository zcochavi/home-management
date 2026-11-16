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
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * Webtop connection for the FamilyHub Android app.
 *
 * Webtop blocks cloud servers, and its CORS settings stop a web page from
 * calling it, but it accepts requests from the phone itself. So:
 *  - open():  shows Webtop's real site (WebtopLoginActivity) for the parent to
 *             log in; returns the per-kid homework params the site used.
 *  - post():  sends a request to Webtop's API from the phone, with the session
 *             cookies from that login. Only Webtop's API host is allowed.
 *  - disconnect(): forgets the Webtop session on this device.
 */
@CapacitorPlugin(name = "WebtopConnect")
public class WebtopConnectPlugin extends Plugin {
    private static final String API_ORIGIN = "https://webtopserver.smartschool.co.il";
    private static final String SITE_ORIGIN = "https://webtop.smartschool.co.il";

    @PluginMethod
    public void open(PluginCall call) {
        Intent intent = new Intent(getContext(), WebtopLoginActivity.class);
        startActivityForResult(call, intent, "onLoginResult");
    }

    @ActivityCallback
    private void onLoginResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        JSObject ret = new JSObject();
        try {
            String json = result.getData() != null ? result.getData().getStringExtra(WebtopLoginActivity.EXTRA_STUDENTS) : null;
            ret.put("students", new JSArray(json != null ? json : "[]"));
        } catch (Exception e) {
            ret.put("students", new JSArray());
        }
        call.resolve(ret);
    }

    @PluginMethod
    public void post(PluginCall call) {
        String url = call.getString("url", "");
        String body = call.getString("body", "");
        if (url == null || !url.startsWith(API_ORIGIN + "/")) {
            call.reject("Only Webtop API URLs are allowed");
            return;
        }
        new Thread(() -> {
            HttpURLConnection conn = null;
            try {
                CookieManager cm = CookieManager.getInstance();
                conn = (HttpURLConnection) new URL(url).openConnection();
                conn.setConnectTimeout(20000);
                conn.setReadTimeout(30000);
                conn.setRequestMethod("POST");
                conn.setDoOutput(true);
                // Same headers Webtop's own site sends.
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("Accept", "application/json, text/plain, */*");
                conn.setRequestProperty("Language", "he");
                conn.setRequestProperty("Rememberme", "0");
                conn.setRequestProperty("Origin", SITE_ORIGIN);
                conn.setRequestProperty("Referer", SITE_ORIGIN + "/");
                conn.setRequestProperty("User-Agent", WebSettings.getDefaultUserAgent(getContext()));
                String cookies = cm.getCookie(API_ORIGIN);
                if (cookies != null && !cookies.isEmpty()) conn.setRequestProperty("Cookie", cookies);

                try (OutputStream os = conn.getOutputStream()) {
                    os.write(body.getBytes(StandardCharsets.UTF_8));
                }
                int status = conn.getResponseCode();

                // Webtop refreshes its session cookie on responses — keep it.
                Map<String, List<String>> headers = conn.getHeaderFields();
                for (Map.Entry<String, List<String>> h : headers.entrySet()) {
                    if (h.getKey() != null && h.getKey().equalsIgnoreCase("Set-Cookie")) {
                        for (String c : h.getValue()) cm.setCookie(API_ORIGIN, c);
                    }
                }
                cm.flush();

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
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Webtop request failed: " + e.getMessage(), e);
            } finally {
                if (conn != null) conn.disconnect();
            }
        }).start();
    }

    @PluginMethod
    public void disconnect(PluginCall call) {
        CookieManager cm = CookieManager.getInstance();
        for (String origin : new String[] { API_ORIGIN, SITE_ORIGIN }) {
            String cookies = cm.getCookie(origin);
            if (cookies == null) continue;
            for (String c : cookies.split(";")) {
                String name = c.split("=", 2)[0].trim();
                if (name.isEmpty()) continue;
                // Expire the cookie for both the host and the shared parent domain.
                cm.setCookie(origin, name + "=; Max-Age=0; Path=/");
                cm.setCookie(origin, name + "=; Max-Age=0; Path=/; Domain=.smartschool.co.il");
            }
        }
        cm.flush();
        call.resolve();
    }
}
