import { auth } from "../src/lib/auth/auth";

async function testAuth() {
  try {
    const email = `user_${Date.now()}@playtube.local`;
    console.log("Testing fresh user sign-up with:", email);
    const res = await auth.api.signUpEmail({
      body: {
        email,
        password: "password123",
        name: "PlayTube Tester",
        username: `user_${Date.now()}`,
      },
    });
    console.log("Sign up SUCCESS! User ID:", res.user.id);

    console.log("Testing sign-in with:", email);
    const loginRes = await auth.api.signInEmail({
      body: {
        email,
        password: "password123",
      },
    });
    console.log("Sign in SUCCESS! Session Token:", loginRes.token);
  } catch (err: any) {
    console.error("Auth test error:", err);
  }
}
testAuth();
