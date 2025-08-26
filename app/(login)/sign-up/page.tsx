import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-cpn-dark flex items-center justify-center p-4">
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
          <div className="w-full max-w-sm">
            <SignUp 
              appearance={{
                variables: {
                  colorPrimary: "#f2f661",
                  colorBackground: "#1f1f1f",
                  colorText: "#ffffff"
                }
              }}
              signInUrl="/sign-in"
              afterSignUpUrl="/dashboard"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
