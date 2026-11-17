package com.familyhub.app;

import android.app.Activity;
import android.app.PendingIntent;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.IntentSenderRequest;
import androidx.activity.result.contract.ActivityResultContracts;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.auth.api.identity.AuthorizationRequest;
import com.google.android.gms.auth.api.identity.AuthorizationResult;
import com.google.android.gms.auth.api.identity.Identity;
import com.google.android.gms.common.api.Scope;

import java.util.ArrayList;
import java.util.List;

/**
 * Google Calendar permission for the FamilyHub Android app.
 *
 * Google blocks its web consent popup inside apps, so this shows Android's native
 * Google authorization screen instead and returns a one-time server auth code for
 * the given web OAuth client (the one the website's calendar connection uses). The
 * server exchanges that code for a refresh token exactly like the website's code
 * (gcalExchangeCode), so the connection is shared with the website.
 *
 * Requires an Android OAuth client (package + signing SHA-1) in the same Google
 * Cloud project as that web client.
 */
@CapacitorPlugin(name = "GoogleCalendarAuth")
public class GoogleCalendarAuthPlugin extends Plugin {
    private ActivityResultLauncher<IntentSenderRequest> consentLauncher;
    private PluginCall pendingCall;

    @Override
    public void load() {
        // Must be registered before the activity starts (plugins load in onCreate).
        consentLauncher = getActivity().registerForActivityResult(
            new ActivityResultContracts.StartIntentSenderForResult(),
            result -> {
                PluginCall call = pendingCall;
                pendingCall = null;
                if (call == null) return;
                if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null) {
                    call.reject("canceled");
                    return;
                }
                try {
                    AuthorizationResult ar = Identity.getAuthorizationClient(getContext())
                        .getAuthorizationResultFromIntent(result.getData());
                    resolveWith(call, ar);
                } catch (Exception e) {
                    call.reject("Authorization failed: " + e.getMessage(), e);
                }
            }
        );
    }

    @PluginMethod
    public void authorize(PluginCall call) {
        String serverClientId = call.getString("serverClientId");
        JSArray scopesArr = call.getArray("scopes");
        if (serverClientId == null || serverClientId.isEmpty() || scopesArr == null) {
            call.reject("serverClientId and scopes are required");
            return;
        }
        List<Scope> scopes = new ArrayList<>();
        try {
            for (Object s : scopesArr.toList()) scopes.add(new Scope(String.valueOf(s)));
        } catch (Exception e) {
            call.reject("Invalid scopes");
            return;
        }

        // forceCodeForRefreshToken=true: always return a code that yields a refresh token,
        // so the server can keep the connection.
        AuthorizationRequest request = AuthorizationRequest.builder()
            .setRequestedScopes(scopes)
            .requestOfflineAccess(serverClientId, true)
            .build();

        Identity.getAuthorizationClient(getContext())
            .authorize(request)
            .addOnSuccessListener(ar -> {
                if (ar.hasResolution()) {
                    PendingIntent pi = ar.getPendingIntent();
                    if (pi == null) { call.reject("No consent screen available"); return; }
                    pendingCall = call;
                    consentLauncher.launch(new IntentSenderRequest.Builder(pi.getIntentSender()).build());
                } else {
                    resolveWith(call, ar); // already granted
                }
            })
            .addOnFailureListener(e -> call.reject("Authorization failed: " + e.getMessage(), e));
    }

    private void resolveWith(PluginCall call, AuthorizationResult ar) {
        JSObject ret = new JSObject();
        ret.put("serverAuthCode", ar.getServerAuthCode());
        ret.put("accessToken", ar.getAccessToken());
        JSArray granted = new JSArray();
        if (ar.getGrantedScopes() != null) for (String s : ar.getGrantedScopes()) granted.put(s);
        ret.put("grantedScopes", granted);
        call.resolve(ret);
    }
}
