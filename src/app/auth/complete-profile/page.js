import CompleteProfileForm from "../../../components/auth/CompleteProfileForm";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import Card from "../../../components/ui/Card";

export default function CompleteProfilePage() {
  return (
    <ProtectedRoute>
       <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
               <div className="w-full max-w-md">
                 <CompleteProfileForm />
               </div>
             </main>
    </ProtectedRoute>
  );
}
