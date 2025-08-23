import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-cpn-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-cpn-yellow rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-cpn-dark">CPN</span>
          </div>
          <h1 className="text-3xl font-bold text-cpn-white mb-2">
            Welcome Back
          </h1>
          <p className="text-cpn-gray">
            Sign in to access your CPN data
          </p>
        </div>
        
        <SignIn 
          appearance={{
            variables: {
              colorPrimary: "#f2f661",
              colorBackground: "#1f1f1f",
              colorText: "#ffffff",
              colorTextSecondary: "#ABABAB",
              colorDanger: "#ef4444",
              colorSuccess: "#22c55e",
              borderRadius: "0.5rem",
              fontFamily: '"ESKlarheit", "Inter", system-ui, sans-serif',
              fontSize: "16px",
            },
            elements: {
              card: "bg-cpn-dark border border-cpn-gray/30 shadow-lg",
              headerTitle: "text-cpn-white font-bold text-xl",
              headerSubtitle: "text-cpn-gray text-sm",
              socialButtonsBlockButton: "bg-cpn-dark border border-cpn-gray/30 text-cpn-white hover:bg-cpn-gray/10",
              socialButtonsBlockButtonText: "text-cpn-white",
              formFieldInput: "bg-cpn-dark border-cpn-gray/30 text-cpn-white placeholder:text-cpn-gray focus:border-cpn-yellow focus:ring-2 focus:ring-cpn-yellow/50",
              formFieldLabel: "text-cpn-white font-medium",
              formButtonPrimary: "bg-cpn-yellow hover:bg-cpn-yellow/90 text-cpn-dark font-semibold py-3 px-6 rounded-cpn transition-all duration-200 hover:scale-105",
              formButtonSecondary: "bg-transparent border border-cpn-gray text-cpn-white hover:bg-cpn-gray/10",
              footerActionLink: "text-cpn-yellow hover:text-cpn-yellow/80",
              otpCodeFieldInput: "bg-cpn-dark border-cpn-gray/30 text-cpn-white focus:border-cpn-yellow",
              identityPreviewText: "text-cpn-white",
              identityPreviewEditButtonIcon: "text-cpn-yellow",
              formFieldError: "text-red-400",
              formFieldSuccessText: "text-green-400",
              dividerLine: "bg-cpn-gray/30",
              dividerText: "text-cpn-gray",
              formFieldHintText: "text-cpn-gray text-sm",
              formHeaderSubtitle: "text-cpn-gray",
            }
          }}
          signUpUrl="/sign-up"
          routing="hash"
          afterSignOutUrl="/"
          afterSignInUrl="/dashboard"
        />
      </div>
    </main>
  );
}
