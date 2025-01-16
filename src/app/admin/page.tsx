import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  username: string;
  id: string;
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token =  cookieStore.get("token")?.value;

  if (!token) {
    return <div>Unauthorized. Please log in.</div>;
  }

  let username = "";
  try {
    const decoded: DecodedToken = jwtDecode(token);
    username = decoded.username;
  } catch (error) {
    return <div>Invalid token. Please log in again.</div>;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {username}!
        </h1>
      </div>
    </div>
  );
}
