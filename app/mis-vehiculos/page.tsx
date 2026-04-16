<<<<<<< HEAD
"use client";

const Page = () => {
  return (
    <div className="p-8 bg-white min-h-screen text-black">
      <h1 className="text-3xl font-bold text-gray-800">Mis Vehículos</h1>
      <p className="text-gray-500 mt-2">Gestiona tus vehículos registrados.</p>
    </div>
=======
// app/mis-vehiculos/page.tsx
import MyVehiclesPage from '../components/pages/MisVehiculosPage/MisVehiculosPage';

const Page = () => {
  return (
    <MyVehiclesPage />
>>>>>>> 198803deff964e2896bca7b0e90109c89e8c005f
  );
};

export default Page;