import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  username: string;
  email: string;
  id: string;
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return <div>Unauthorized. Please log in.</div>;
  }

  let username = "";
  let email = "";

  try {
    const decoded: DecodedToken = jwtDecode(token);
    username = decoded.username;
    email = decoded.email;
  } catch (error) {
    return <div>Invalid token. Please log in again.</div>;
  }



  return (
    <div className="flex items-center justify-center h-screen">
      <div className="p-6 rounded-lg ">
        <h1 className="text-2xl font-bold">
          Welcome, @{username} <br />
          your email is {email}
        </h1>
        <button className="px-7 py-3 mt-3 border-white border-2 rounded-full">Logout</button><br />
        <small className="opacity-50 text-red-600">*this button does not work yet</small>
      </div>
    </div>
  );
}
