package com.familyhub.app;

import android.os.Bundle;

import androidx.activity.OnBackPressedCallback;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // App-local plugins must be registered before the bridge starts.
        registerPlugin(WebtopConnectPlugin.class);
        registerPlugin(MashovConnectPlugin.class);
        registerPlugin(GoogleCalendarAuthPlugin.class);
        super.onCreate(savedInstanceState);

        // Back: the web app's screens are overlays on one page (no WebView history), so ask it
        // to close the topmost one (window.fhBack in app.js). Only when nothing is left to
        // close does the app go to the background — kept, not closed, like other Android apps.
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (bridge == null || bridge.getWebView() == null) { moveTaskToBack(true); return; }
                bridge.getWebView().evaluateJavascript(
                    "(function(){try{return !!(window.fhBack&&window.fhBack());}catch(e){return false;}})()",
                    result -> { if (!"true".equals(result)) moveTaskToBack(true); });
            }
        });
    }
}
