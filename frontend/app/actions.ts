"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { profile } from "console";

export const signUpAction = async (formData: FormData) => { // this is the function that happens when we sign up 
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const input_display_name = formData.get("display_name")?.toString(); // how do I make sure this works? How is display name passed in the form? 
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  // Step 1: check to make sure email and password exist
  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }
 
  // Step 2: try to create a user 
    // how does the error handling work? TODO: review this syntax 
  const { data, error : signUpError } = await supabase.auth.signUp({ // this line is destructuring the result of this signup function 
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  // Step 3: handle what happens if we have an error. This encoded redirect utility function will redirect to a different page with a message 
  if (signUpError) {
    console.error(signUpError.code + " " + signUpError.message);
    return encodedRedirect("error", "/sign-up", signUpError.message);
  }
  
  // Step 4: Handle everything before completion 
  const user = data.user;

  if (user && input_display_name) { // check to see if we have a user and display name 

    // flow is to 1) use sql trigger to create the row then 2) this update function will update the display name 
    const {data: select_data, error: profileError} = await supabase 
      .from('profiles')
      .update({display_name: input_display_name})
      .eq('id', user.id)
      .select();

    console.log("Update query result here: ", select_data, "ERROR: ", profileError)

    if (profileError) {
      console.error("Profile Erorr", profileError.message) // log error
      return encodedRedirect("error", "/sign-up", "Couldn't create profile");
    }
  }

  // Step 5: redirect to success page / sign up page   
  return encodedRedirect(
    "success",
    "/sign-in",
    "Thanks for signing up! Please check your email for a verification link.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/lobby");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/lobby/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/lobby/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/lobby/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/lobby/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/lobby/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
