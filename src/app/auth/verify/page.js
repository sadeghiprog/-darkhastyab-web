import VerifyOtpForm from "../../../components/auth/VerifyOtpForm";
import Card from "../../../components/ui/Card";

export default function VerifyPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
         <div className="w-full max-w-md">
           <VerifyOtpForm />
         </div>
       </main>
  );
}
