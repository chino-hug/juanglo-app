import { MOCK_MODE } from "@/lib/mock/config";
import { LoginForm } from "./login-form";

export default function IngresarPage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="label-plate mx-auto mb-4 w-fit">Velas · Sistema ISG-01</p>
          <h1 className="display text-4xl">
            Iniciá
            <br />
            sesión
          </h1>
        </div>
        <LoginForm />
        {MOCK_MODE && (
          <div className="mt-6 border border-dashed border-steel px-3 py-3 text-xs text-concrete">
            <p className="field-label mb-2">Modo prueba — sin base de datos</p>
            <p>Contraseña para todas: velas1234</p>
            <ul className="mt-1 space-y-0.5">
              <li>vendedora1@velas.test — vendedora</li>
              <li>vendedora2@velas.test — vendedora</li>
              <li>admin@velas.test — admin</li>
              <li>preparacion@velas.test — preparación</li>
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
