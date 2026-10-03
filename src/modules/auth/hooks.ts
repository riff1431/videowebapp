"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { syncCurrentAccountAction } from "@/modules/auth/switch-account.actions";
import { getRegistrationStatusAction } from "@/modules/auth/registration.actions";
import { requestPasswordResetAction, resetPasswordAction } from "@/modules/auth/password.actions";

/**
 * Validate redirect path to prevent open redirects.
 * Only relative same-origin paths starting with / (and not //) are allowed.
 */
export function sanitizeRedirectPath(path: string | null | undefined, fallback = "/"): string {
  if (!path || typeof path !== "string") return fallback;
  const trimmed = path.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("\\")) {
    return trimmed;
  }
  return fallback;
}

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = sanitizeRedirectPath(searchParams?.get("redirect") || searchParams?.get("next") || "/");

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberDevice, setRememberDevice] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const isEmail = usernameOrEmail.includes("@");
      let res;
      if (isEmail) {
        res = await authClient.signIn.email({
          email: usernameOrEmail.trim(),
          password,
        });
      } else {
        res = await authClient.signIn.username({
          username: usernameOrEmail.trim(),
          password,
        });
      }

      if (res?.error) {
        setError(res.error.message || "Invalid username or password");
      } else {
        try {
          await syncCurrentAccountAction();
        } catch (syncErr) {
          console.error("Failed to sync account:", syncErr);
        }
        router.push(redirectUrl);
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    usernameOrEmail,
    setUsernameOrEmail,
    password,
    setPassword,
    rememberDevice,
    setRememberDevice,
    error,
    setError,
    loading,
    handleSubmit,
  };
}

export function useRegister() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialInvite = searchParams?.get("invite") || searchParams?.get("code") || "";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("male");
  const [inviteCode, setInviteCode] = useState(initialInvite);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [regStatus, setRegStatus] = useState<{
    registrationEnabled: boolean;
    inviteOnly: boolean;
    checked: boolean;
  }>({
    registrationEnabled: true,
    inviteOnly: false,
    checked: false,
  });

  useEffect(() => {
    getRegistrationStatusAction().then((status) => {
      setRegStatus({
        ...status,
        checked: true,
      });
    });
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    if (!acceptTerms) {
      setError("Please accept the terms of use and privacy policy");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (regStatus.inviteOnly && !inviteCode.trim()) {
      setError("An invitation code is required to register");
      return;
    }

    setLoading(true);

    try {
      const res = await authClient.signUp.email({
        email: email.trim(),
        password,
        name: username.trim(),
        username: username.trim(),
        gender,
        inviteCode: inviteCode.trim(),
      } as any);

      if (res?.error) {
        setError(res.error.message || "Failed to register account");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    gender,
    setGender,
    inviteCode,
    setInviteCode,
    acceptTerms,
    setAcceptTerms,
    error,
    setError,
    loading,
    regStatus,
    handleSubmit,
  };
}

export function useForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.set("email", email);

      const res = await requestPasswordResetAction(formData);
      if (res.success) {
        setSuccessMsg((res as any).message || "Reset link dispatched.");
      } else {
        setError((res as any).error || "Failed to submit request.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    loading,
    error,
    setError,
    successMsg,
    handleSubmit,
  };
}

export function useResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";
  const email = searchParams?.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("token", token);
      formData.set("password", password);
      formData.set("confirmPassword", confirmPassword);

      const res = await resetPasswordAction(formData);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(res.error || "Failed to reset password.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    setError,
    success,
    token,
    email,
    handleSubmit,
  };
}
