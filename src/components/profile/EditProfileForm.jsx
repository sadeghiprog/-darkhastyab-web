"use client";

import { useEffect, useState } from "react";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import Card from "../../../components/ui/Card";
import { profileService } from "../../../services/profile.service";

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    name: "",
    firstName: "",
    lastName: "",
    nationalCode: "",
    companyName: "",
    companyRegNo: "",
    address: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      try {
        console.log("[EditProfilePage] fetching profile...");

        const data = await profileService.getProfile();

        console.log("[EditProfilePage] raw response:", data);
        console.log("[EditProfilePage] response keys:", Object.keys(data || {}));
        console.log("[EditProfilePage] top profile:", data?.profile);
        console.log("[EditProfilePage] nested profile:", data?.profile?.profile);

        if (!mounted) return;

        const topProfile = data?.profile;
        const nestedProfile = topProfile?.profile;

        const nextFormData = {
          name: topProfile?.name || "",
          firstName: nestedProfile?.firstName || "",
          lastName: nestedProfile?.lastName || "",
          nationalCode: nestedProfile?.nationalCode || "",
          companyName: nestedProfile?.companyName || "",
          companyRegNo: nestedProfile?.companyRegNo || "",
          address: nestedProfile?.address || "",
        };

        console.log("name", name);
        console.log("firstname", firstName);
        console.log("[EditProfilePage] mapped form data:", nextFormData);

        setFormData(nextFormData);

        if (nestedProfile?.avatarUrl) {
          const fullAvatarUrl = `${process.env.NEXT_PUBLIC_API_URL}${nestedProfile.avatarUrl}`;
          console.log("[EditProfilePage] avatar URL:", fullAvatarUrl);
          setAvatarPreview(fullAvatarUrl);
        } else {
          console.log("[EditProfilePage] no avatarUrl found in nested profile");
        }
      } catch (err) {
        console.error("[EditProfilePage] fetchProfile error:", err);
        if (mounted) {
          setError(err?.message || "خطا در دریافت اطلاعات پروفایل");
        }
      } finally {
        if (mounted) {
          setInitLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      console.log("[EditProfilePage] field change:", name, value);
      return next;
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      console.log("[EditProfilePage] no avatar file selected");
      return;
    }

    console.log("[EditProfilePage] selected avatar file:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    setAvatarFile(file);

    if (avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      console.log("[EditProfilePage] submit payload:", formData);

      const updateResult = await profileService.updateProfile(formData);
      console.log("[EditProfilePage] updateProfile result:", updateResult);

      if (avatarFile) {
        console.log("[EditProfilePage] uploading avatar:", {
          name: avatarFile.name,
          type: avatarFile.type,
          size: avatarFile.size,
        });

        const avatarResult = await profileService.uploadAvatar(avatarFile);
        console.log("[EditProfilePage] uploadAvatar result:", avatarResult);
      }

      alert("اطلاعات با موفقیت ذخیره شد");
    } catch (err) {
      console.error("[EditProfilePage] submit error:", err);
      setError(err?.message || "خطا در ذخیره اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return <div className="text-center p-10">در حال بارگذاری اطلاعات...</div>;
  }

  return (
    <main className="max-w-2xl mx-auto p-4">
      <Card>
        <h1 className="text-2xl font-bold mb-6 text-center">
          ویرایش اطلاعات حساب
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-3">
            <label className="cursor-pointer">
              <div className="w-28 h-28 rounded-full overflow-hidden border border-gray-300">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    انتخاب عکس
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>

            <span className="text-xs text-gray-500">
              برای تغییر عکس روی آن کلیک کنید
            </span>
          </div>

          <Input
            label="نام نمایشی"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />

          <Input
            label="نام"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />

          <Input
            label="نام خانوادگی"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />

          <Input
            label="کد ملی"
            name="nationalCode"
            value={formData.nationalCode}
            onChange={handleChange}
          />

          <Input
            label="نام شرکت"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
          />

          <Input
            label="شماره ثبت شرکت"
            name="companyRegNo"
            value={formData.companyRegNo}
            onChange={handleChange}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              آدرس
            </label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Alert message={error} />

          <Button
            type="submit"
            loading={loading}
            className="w-full py-3 text-lg"
          >
            ذخیره اطلاعات
          </Button>
        </form>
      </Card>
    </main>
  );
}
