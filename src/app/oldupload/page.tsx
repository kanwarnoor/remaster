"use client";

import React from "react";
import axios from "axios";

export default function Upload() {
  const [progress, setProgress] = React.useState(0);

  const upload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fileInput = e.currentTarget.querySelector("input[type='file']");
    if (!fileInput) {
      console.log("Please select a file!");
      return;
    }
    const file = (fileInput as HTMLInputElement).files?.[0];
    if (!file) {
      console.log("Please select a file!");
      (fileInput as HTMLInputElement).value = "";
      return;
    }

    // if (!file.type.startsWith("audio/")) {
    //   alert("Please select an audio file!");
    //   (fileInput as HTMLInputElement).value = "";
    //   return;
    // }

    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post("/api/upload/init", {
      type: file.type,
      size: file.size,
    });

    if (response.status !== 200) {
      console.log("Error generating url(s)");
      (fileInput as HTMLInputElement).value = "";
      return;
    }

    const { uploadId, urls, key } = response.data;

    // Upload the chunks in parellel

    const chunkSize = 5 * 1024 * 1024; // 4MB
    const uploadPromises = [];
    const uploadResult: { ETag: any; PartNumber: number }[] = [];

    // split file into chunks
    for (let partNumber = 1; partNumber <= urls.length; partNumber++) {
      const start = (partNumber - 1) * chunkSize;
      const end = Math.min(partNumber * chunkSize, file.size);
      const chunk = file.slice(start, end);

      const presignedUrl = urls.find(
        (u: any) => u.partNumber == partNumber
      )?.url;

      if (!presignedUrl) {
        console.log("Missing presigned url for part " + partNumber);
        (fileInput as HTMLInputElement).value = "";
        return;
      }

      const uploadPromise = axios
        .put(presignedUrl, chunk, {
          headers: {
            "Content-Type": file.type,
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted =
              Math.round((progressEvent.loaded * 100) / (progressEvent.total ?? 1));
            setProgress((prev) => prev + percentCompleted);

          },
        })
        .then((response) => {
          console.log("Response headers:", response.headers);
          // extract ETag
          let etag = null;

          if (response.headers.etag) {
            etag = response.headers.etag;
          } else if (response.headers.ETag) {
            etag = response.headers.ETag;
          } else if (typeof response.headers.get === 'function') {
            etag = response.headers.get('etag');
          } else {
            // Last resort: search through all headers
            Object.keys(response.headers).forEach(key => {
              if (key.toLowerCase() === 'etag') {
                etag = response.headers[key];
              }
            });
          }

          console.log(`Part ${partNumber} ETag extracted:`, etag);
          // make sure etag exists
          const cleanEtag = etag ? etag.replace(/"/g, "") : null;

          if (!cleanEtag) {
            console.log(
              "Error uploading chunk (etag extraction error) " + partNumber
            );
            (fileInput as HTMLInputElement).value = "";
            return;
          }

          uploadResult.push({
            ETag: cleanEtag,
            PartNumber: partNumber,
          });

          return response;
        });

      uploadPromises.push(uploadPromise);
    }

    try {
      // upload in parallel
      await Promise.all(uploadPromises);

      uploadResult.sort((a, b) => a.PartNumber - b.PartNumber);

      const completeResponse = await axios.post("/api/upload/complete", {
        uploadId,
        key,
        parts: uploadResult,
      });

      if (completeResponse.status === 200) {
        console.log("Upload complete!");
        (fileInput as HTMLInputElement).value = "";
      } else {
        throw new Error("Error completing upload");
      }
    } catch (error) {
      console.log("Error uploading file", error);

      try {
        await axios.post("/api/upload/abort", {
          uploadId,
          key,
        });
      } catch (error) {
        console.log("Error aborting upload", error);
      }
    }

    // Complete the multipart upload
    // const completeResponse = await axios.post("/api/upload/complete", {
    //   uploadId,
    //   key,
    // });
    // if (completeResponse.status !== 200) {
    //   alert("Error completing upload");
    //   (fileInput as HTMLInputElement).value = "";
    //   return;
    // }
    // alert("Upload complete!");
    // (fileInput as HTMLInputElement).value = "";

    console.log(urls, uploadId, key);
  };

  return (
    <div className="flex flex-col w-screen items-center justify-center h-screen">
      <form
        className="flex flex-col justify-center items-center"
        onSubmit={(e) => upload(e)}
      >
        <input type="file" />
        <button
          type="submit"
          className="px-7 py-3 bg-white text-black w-fit flex rounded-md mt-10"
        >
          Upload
        </button>

        {/* show progress */}
        <div className="w-full h-2 bg-gray-200 rounded-md mt-5">
          <div
            className="h-full bg-blue-500 rounded-md animate-pulse"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </form>
    </div>
  );
}
