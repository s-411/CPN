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
        
        <div className="flex justify-center">
          <div className="w-full max-w-sm">
            <SignIn 
              appearance={{
                variables: {
                  colorPrimary: "#f2f661",
                  colorBackground: "#1f1f1f",
                  colorText: "#ffffff"
                }
              }}
              signUpUrl="/sign-up"
              afterSignInUrl="/dashboard"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
