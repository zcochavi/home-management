package com.familyhub.app;

import android.content.Intent;
import android.net.Uri;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Google Calendar consent for the FamilyHub Android app.
 *
 * Google blocks its consent popup inside apps (WebViews), so the app opens
 * Google's normal consent page in the phone's browser instead. Google then
 * redirects to the gcalOAuthCallback Cloud Function, which saves the connection
 * and offers a "back to FamilyHub" link (familyhub://gcal-connected).
 */
@CapacitorPlugin(name = "GoogleCalendarAuth")
public class GoogleCalendarAuthPlugin extends Plugin {
    @PluginMethod
    public void openConsent(PluginCall call) {
        String url = call.getString("url", "");
        if (url == null || !url.startsWith("https://accounts.google.com/")) {
            call.reject("Only Google sign-in URLs are allowed");
            return;
        }
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not open the browser: " + e.getMessage(), e);
        }
    }
}
