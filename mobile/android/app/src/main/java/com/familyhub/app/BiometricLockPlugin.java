package com.familyhub.app;

import androidx.annotation.NonNull;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.FragmentActivity;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Fingerprint check for protected parent profiles (see _fpVerify in app.js).
 * Uses the phone's own biometric prompt; the fingerprint never leaves the phone —
 * the app only learns "confirmed" or "not confirmed".
 */
@CapacitorPlugin(name = "BiometricLock")
public class BiometricLockPlugin extends Plugin {
    private static final int AUTHENTICATORS = BiometricManager.Authenticators.BIOMETRIC_STRONG
        | BiometricManager.Authenticators.BIOMETRIC_WEAK;

    @PluginMethod
    public void isAvailable(PluginCall call) {
        int r = BiometricManager.from(getContext()).canAuthenticate(AUTHENTICATORS);
        JSObject ret = new JSObject();
        ret.put("available", r == BiometricManager.BIOMETRIC_SUCCESS);
        ret.put("enrolled", r != BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED);
        call.resolve(ret);
    }

    @PluginMethod
    public void authenticate(PluginCall call) {
        String title = call.getString("title", "אימות טביעת אצבע");
        String subtitle = call.getString("subtitle", "");
        String cancel = call.getString("cancel", "ביטול");
        FragmentActivity activity = getActivity();
        activity.runOnUiThread(() -> {
            try {
                BiometricPrompt prompt = new BiometricPrompt(activity, ContextCompat.getMainExecutor(activity),
                    new BiometricPrompt.AuthenticationCallback() {
                        @Override
                        public void onAuthenticationSucceeded(@NonNull BiometricPrompt.AuthenticationResult result) {
                            JSObject ret = new JSObject();
                            ret.put("ok", true);
                            call.resolve(ret);
                        }

                        @Override
                        public void onAuthenticationError(int code, @NonNull CharSequence msg) {
                            JSObject ret = new JSObject();
                            ret.put("ok", false);
                            ret.put("code", code);
                            ret.put("message", msg.toString());
                            call.resolve(ret);
                        }
                        // onAuthenticationFailed (a finger that doesn't match) keeps the prompt open
                    });
                BiometricPrompt.PromptInfo.Builder info = new BiometricPrompt.PromptInfo.Builder()
                    .setTitle(title)
                    .setNegativeButtonText(cancel)
                    .setAllowedAuthenticators(AUTHENTICATORS);
                if (subtitle != null && !subtitle.isEmpty()) info.setSubtitle(subtitle);
                prompt.authenticate(info.build());
            } catch (Exception e) {
                JSObject ret = new JSObject();
                ret.put("ok", false);
                ret.put("message", String.valueOf(e.getMessage()));
                call.resolve(ret);
            }
        });
    }
}
