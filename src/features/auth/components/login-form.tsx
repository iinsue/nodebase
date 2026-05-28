"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isSocialPending, setIsSocialPending] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signInGithub = async () => {
    if (isSocialPending) return;
    setIsSocialPending(true);

    try {
      await authClient.signIn.social(
        {
          provider: "github",
        },
        {
          onSuccess: () => {
            router.push("/");
          },
          onError: () => {
            toast.error("Something went wrong");
          },
        },
      );
    } finally {
      setIsSocialPending(false);
    }
  };

  const signInGoogle = async () => {
    if (isSocialPending) return;
    setIsSocialPending(true);

    try {
      await authClient.signIn.social(
        {
          provider: "google",
        },
        {
          onSuccess: () => {
            router.push("/");
          },
          onError: () => {
            toast.error("Something went wrong");
          },
        },
      );
    } finally {
      setIsSocialPending(false);
    }
  };

  const onSubmit = async (values: LoginFormValues) => {
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          router.push("/");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    );
  };

  const isPending = form.formState.isSubmitting || isSocialPending;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Login to continue</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="grid gap-6">
                <div className="flex flex-col gap-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    type="button"
                    disabled={isPending}
                    onClick={signInGithub}
                  >
                    <Image
                      src="/logos/github.svg"
                      alt="github"
                      width={20}
                      height={20}
                    />
                    Continue with Github
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    type="button"
                    disabled={isPending}
                    onClick={signInGoogle}
                  >
                    <Image
                      src="/logos/google.svg"
                      alt="google"
                      width={20}
                      height={20}
                    />
                    Continue with Google
                  </Button>
                </div>

                <FieldSeparator />

                <div className="grid gap-6">
                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="login-email">Email</FieldLabel>
                        <Input
                          id="login-email"
                          aria-invalid={fieldState.invalid}
                          type="email"
                          placeholder="m@example.com"
                          {...field}
                        />

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="login-password">
                          Password
                        </FieldLabel>
                        <Input
                          id="login-password"
                          aria-invalid={fieldState.invalid}
                          type="password"
                          placeholder="********"
                          {...field}
                        />

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  Login
                </Button>
              </div>

              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link href="/signup" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
