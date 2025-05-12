"use client";

import { Button } from "@/src/ui/button";
import { useActionState } from "react";
import { signup } from "@/src/server-actions/users";
import Image from "next/image";
import Link from "next/link";
import { AtSymbolIcon, UserIcon } from "@heroicons/react/24/outline";

export default function SignupFormV2() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Container for image and heading */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image
          alt="Your Company"
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
          className="mx-auto h-10 w-auto"
          width={40}
          height={40}
        />
        <h2 className="text-text-secondary mt-6 text-center text-2xl/9 font-bold tracking-tight">
          Sign up for an account
        </h2>
      </div>

      {/* Container for the sign-up form, social signup, and link to the log-in page*/}
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-bg-primary px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
          {/* form with email and password */}
          <form action={action} className="space-y-6">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="text-text-secondary block text-sm/6 font-medium"
              >
                Username
              </label>
              <div className="@container mt-2 flex items-center">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  className="bg-bg-accent text-text-primary ring-bg-accent placeholder:text-text-accent focus:ring-bg-focus block w-full rounded-md px-3 py-1.5 ring-1 ring-inset focus:ring-2 sm:text-sm/6"
                  data-cy="signup-username-input"
                />
                <UserIcon className="text-text-accent pointer-events-none ml-2 h-[18px] w-[18px]" />
              </div>
            </div>
            {state?.errors?.username && (
              <p className="text-text-error" data-cy="signup-username-errors">
                {state.errors.username}
              </p>
            )}
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="text-text-secondary block text-sm/6 font-medium"
              >
                Email address
              </label>
              <div className="@container mt-2 flex items-center">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="bg-bg-accent text-text-primary ring-bg-accent placeholder:text-text-accent focus:ring-bg-focus block w-full rounded-md px-3 py-1.5 ring-1 ring-inset focus:ring-2 sm:text-sm/6"
                  data-cy="signup-email-input"
                />
                <AtSymbolIcon className="text-text-accent pointer-events-none ml-2 h-[18px] w-[18px]" />
              </div>
            </div>
            {state?.errors?.email && (
              <p data-cy="signup-email-errors" className="text-text-error">
                {state.errors.email}
              </p>
            )}
            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="text-text-secondary block text-sm/6 font-medium"
              >
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="bg-bg-accent text-text-primary ring-bg-accent placeholder:text-text-accent focus:ring-bg-focus block w-full rounded-md px-3 py-1.5 ring-1 ring-inset focus:ring-2 sm:text-sm/6"
                  data-cy="signup-password-input"
                />
              </div>
            </div>
            {state?.errors?.password && (
              <div className="text-text-error">
                <p>Password must:</p>
                <ul>
                  {state.errors.password.map((error) => (
                    <li data-cy="signup-password-errors" key={error}>
                      - {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Remember Me and Forgot Password*/}
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <div className="flex h-6 shrink-0 items-center">
                  <div className="group grid size-4 grid-cols-1">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="border-bg-accent bg-bg-accent text-bg-active focus:ring-bg-focus col-start-1 row-start-1 h-4 w-4 rounded"
                    />
                    <svg
                      fill="none"
                      viewBox="0 0 14 14"
                      className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white opacity-0 group-has-[:checked]:opacity-100"
                    >
                      <path
                        d="M3 8L6 11L11 3.5"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
                <label
                  htmlFor="remember-me"
                  className="text-text-primary block text-sm/6"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm/6">
                <a
                  href="#"
                  className="text-text-secondary hover:text-text-hover font-semibold"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit button */}
            <div>
              <Button
                type="submit"
                aria-disabled={pending}
                className="bg-bg-active text-text-primary hover:bg-bg-hover focus-visible:outline-bg-focus flex w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2"
                data-cy="signup-submit-button"
              >
                Sign up
              </Button>
            </div>
          </form>
          <div
            className="flex h-8 items-end space-x-1"
            aria-live="polite"
            aria-atomic="true"
          >
            {state?.message && (
              <p data-cy="signup-message-errors" className="text-bg-active">
                {state.message}
              </p>
            )}
          </div>

          {/* Or continue with */}
          <div>
            <div className="relative mt-10">
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center"
              >
                <div className="border-bg-accent w-full border-t" />
              </div>
              <div className="relative flex justify-center text-sm/6 font-medium">
                <span className="bg-bg-primary text-text-secondary px-6">
                  Or sign up with
                </span>
              </div>
            </div>

            {/* Google and GitHub Signup*/}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <a
                href="#"
                className="bg-bg-primary text-text-primary ring-bg-accent hover:bg-bg-accent focus-visible:ring-bg-focus flex w-full items-center justify-center gap-3 rounded-md px-3 py-2 text-sm font-semibold ring-1 focus-visible:ring-2"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                  <path
                    d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                    fill="#EA4335"
                  />
                  <path
                    d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                    fill="#34A853"
                  />
                </svg>
                <span>Google</span>
              </a>

              <a
                href="#"
                className="bg-bg-primary text-text-primary ring-bg-accent hover:bg-bg-accent focus-visible:ring-bg-focus flex w-full items-center justify-center gap-3 rounded-md px-3 py-2 text-sm font-semibold ring-1 focus-visible:ring-2"
              >
                <svg
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  className="size-5"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                  />
                </svg>
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>

        <p className="text-text-accent mt-10 text-center text-sm/6">
          Already a member?{" "}
          <Link
            href="/login"
            className="text-text-secondary hover:text-text-hover font-semibold"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
