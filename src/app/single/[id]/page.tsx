import SingleTrackClient from "./SingleTrackClient";

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  return <SingleTrackClient id={id} />;
}
