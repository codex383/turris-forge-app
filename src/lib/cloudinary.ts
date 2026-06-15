const CLOUD_NAME = "dhbpc2mog";
const UPLOAD_PRESET = "Turris Forge";

export type CloudFile = {
  name: string;
  size: number;
  type: string;
  url: string;
  publicId: string;
};

export const uploadToCloudinary = async (
  file: File,
  folder: string
): Promise<CloudFile> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) throw new Error("Upload failed");

  const data = await res.json();

  return {
    name: file.name,
    size: file.size,
    type: file.type,
    url: data.secure_url,
    publicId: data.public_id,
  };
};
