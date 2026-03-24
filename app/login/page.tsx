import { LoginForm } from "@/components/login-form";

type LoginPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const unauthorized = searchParams?.error === "unauthorized";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div className="architect-grid absolute inset-0 opacity-10" />
      <div className="pointer-events-none absolute -left-10 -top-10 opacity-5">
        <p className="font-headline text-[14rem] font-black tracking-tight text-primary">
          THUANG
        </p>
      </div>
      <div className="pointer-events-none absolute -bottom-16 -right-10 opacity-5">
        <p className="font-headline text-[16rem] font-black tracking-tight text-primary">
          STUDIO
        </p>
      </div>

      <div className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-16 lg:flex-row lg:items-center lg:justify-between">
        <section className="max-w-xl">
          <div className="mb-8 hidden md:block">
            <span className="text-vertical text-[11px] uppercase tracking-[0.45em] text-outline">
              System Access Node 0.1
            </span>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-secondary">
            Studio Administration Portal
          </p>
          <h1 className="mt-6 font-headline text-5xl font-black leading-none tracking-tight text-primary md:text-7xl">
            Digital Monolith
          </h1>
          <p className="mt-6 max-w-lg text-sm leading-8 text-on-surface-variant">
            Admin panel ini dibangun untuk mengelola portfolio project, gallery image,
            dan site settings thuangarchitect.com dengan alur Supabase + Netlify rebuild.
          </p>
        </section>

        <LoginForm unauthorized={unauthorized} />
      </div>
    </main>
  );
}
