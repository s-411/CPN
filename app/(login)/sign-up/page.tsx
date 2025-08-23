import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[url('/Background%20center.avif')] bg-cover bg-center flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-cpn-yellow rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-cpn-dark">CPN</span>
          </div>
          <h1 className="text-3xl font-bold text-cpn-white mb-2">
            You’re almost there
          </h1>
          <p className="text-cpn-gray">
            Drop your email to reveal your CPN and see your date analytics—trends, spend vs outcome, and more.
          </p>
        </div>
        
        <div className="flex justify-center">
          <SignUp 
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
              card: "bg-cpn-dark border border-cpn-gray/30 shadow-lg mx-auto w-full",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              header: "hidden",
              socialButtonsBlockButton: "bg-cpn-dark border border-cpn-gray/30 text-cpn-white hover:bg-cpn-gray/10",
              socialButtonsBlockButtonText: "text-cpn-white",
              formFieldInput: "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-cpn-yellow focus:ring-2 focus:ring-cpn-yellow/50 min-h-[44px] rounded-cpn",
              formFieldLabel: "hidden",
              formButtonPrimary: "bg-cpn-yellow hover:bg-cpn-yellow/90 text-cpn-dark font-semibold py-3 px-6 rounded-cpn transition-all duration-200 hover:scale-105 border-l border-r border-b border-gray-300 border-t border-t-gray-300 !border-t-gray-300",
              formButtonSecondary: "bg-transparent border border-cpn-gray text-cpn-white hover:bg-cpn-gray/10",
              footerActionLink: "text-cpn-yellow hover:text-cpn-yellow/80",
              otpCodeFieldInput: "bg-white border-gray-300 text-gray-900 focus:border-cpn-yellow",
              identityPreviewText: "text-cpn-white",
              identityPreviewEditButtonIcon: "text-cpn-yellow",
              formFieldError: "text-red-400",
              formFieldSuccessText: "text-green-400",
              dividerLine: "bg-cpn-gray/30",
              dividerText: "text-cpn-gray",
              formFieldHintText: "text-cpn-gray text-sm",
              formHeaderSubtitle: "hidden",
            },
            layout: {
              socialButtonsPlacement: "bottom"
            }
          }}
          localization={{
            signUp: {
              start: {
                actionText: "Get verification code"
              }
            }
          }}
          signInUrl="/sign-in"
          routing="hash"
            afterSignUpUrl="/cpn-results"
          />
        </div>
      </div>
      
      <style jsx global>{`
        .cl-formButtonPrimary {
          border-top: 1px solid rgb(209 213 219) !important;
        }
      `}</style>
    </main>
  );
}
