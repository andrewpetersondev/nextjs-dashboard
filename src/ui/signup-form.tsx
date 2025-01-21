"use client";
import { lusitana } from "@/ui/fonts";
import { AtSymbolIcon, KeyIcon } from "@heroicons/react/24/outline";
import { Button } from "@/ui/button";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { userCreate } from "@/actions/user-create";
import { useActionState } from "react";

export default function SignupForm() {
  const [state, action, pending] = useActionState(userCreate, undefined);
  return (
    <form action={action} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>
          Please sign up to continue.
        </h1>
        <div className="w-full">
          <div className="mt-4">
            <label
              htmlFor="username"
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
            >
              Username
            </label>
            <div className="relative">
              {/*  should I include a type attribute for this input?*/}
              <input
                id="username"
                name="username"
                placeholder="Enter your username"
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                required
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            {state?.errors?.username && (
              <p className="text-red-500">{state.errors.username[0]}</p>
            )}
          </div>
          <div className="mt-4">
            <label
              htmlFor="email"
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
            >
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            {state?.errors?.email && (
              <p className="text-red-500">{state.errors.email[0]}</p>
            )}
          </div>
          <div className="mt-4">
            <label
              htmlFor="password"
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="Enter a password"
                required
                minLength={6}
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            {state?.errors?.password && (
              <div>
                <p>Password must:</p>
                <ul>
                  {state.errors.password.map((error) => (
                    <li key={error}>- {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <Button className="mt-4 w-full" disabled={pending} type="submit">
          Sign Up <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>
        {state?.message && <p className="text-green-500">{state.message}</p>}
      </div>
    </form>
  );
}