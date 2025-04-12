import Track from "@/models/Track";
import connectDb from "@/libs/connectDb";
import { User } from "@/libs/Auth";

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const visibility = searchParams.get("visibility");
  if (!id || !visibility) {
    return new Response("Track ID and visibility are required", {
      status: 400,
    });
  }

  await connectDb();

  try {
    const track = await Track.findById(id);
    if (!track) {
      return new Response("Track not found", { status: 404 });
    }
    // check if track belong to user
    const user = await User();
    if (!user) {
      return new Response("User not found", { status: 404 });
    }
    if (track.user.toString() !== user._id.toString()) {
      return new Response("Forbidden", { status: 403 });
    }

    if (track.visibility === visibility) {
      return new Response("Track already has this visibility", { status: 200 });
    }
    track.visibility = visibility;
    await track.save();
    return new Response("Track visibility updated", { status: 200 });
  } catch (error) {
    console.error("Error updating track visibility:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
