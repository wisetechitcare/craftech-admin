import React, { useState, useEffect } from "react";
import { cmsApi } from "../../../services/api";
import toast from "react-hot-toast";
import { Save, Loader2, AlertCircle } from "lucide-react";

const SectionHeader = ({ title, description }: any) => (
  <div className="mb-6 pb-4 border-b border-line">
    <h3 className="text-lg font-bold text-ink mb-1">{title}</h3>
    {description && <p className="text-sm text-ink-mute">{description}</p>}
  </div>
);

const InputField = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: any) => (
  <div>
    <label className="block text-xs font-semibold text-ink-mute uppercase tracking-wider mb-2">
      {label} {required && <span className="text-danger">*</span>}
    </label>
    <input
      type={type}
      required={required}
      placeholder={placeholder}
      className="w-full px-4 py-2 bg-paper border border-line rounded-lg text-ink text-sm focus:border-info focus:outline-none transition-colors"
      value={value || ""}
      onChange={onChange}
    />
  </div>
);

const SelectField = ({
  label,
  value,
  onChange,
  options,
  required = false,
}: any) => (
  <div>
    <label className="block text-xs font-semibold text-ink-mute uppercase tracking-wider mb-2">
      {label} {required && <span className="text-danger">*</span>}
    </label>
    <select
      required={required}
      className="w-full px-4 py-2 bg-paper border border-line rounded-lg text-ink text-sm focus:border-info focus:outline-none transition-colors"
      value={value || ""}
      onChange={onChange}
    >
      <option value="">Select...</option>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const CheckboxField = ({ label, checked, onChange }: any) => (
  <label className="flex items-center gap-3 cursor-pointer p-3 bg-raise rounded-lg hover:bg-paper transition-colors">
    <input
      type="checkbox"
      checked={checked || false}
      onChange={onChange}
      className="w-4 h-4 rounded border-line"
    />
    <span className="text-sm font-medium text-ink">{label}</span>
  </label>
);

export default function Settings() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("company");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await cmsApi.getSettings();
      setData(res.data.data);
    } catch (err) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await cmsApi.updateSettings(data);
      toast.success("Settings saved successfully");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-ink-faint" />
      </div>
    );

  const tabs = [
    { id: "company", label: "Company" },
    { id: "contact", label: "Contact" },
    { id: "social", label: "Social & Web" },
    { id: "business", label: "Business Hours" },
    { id: "cta", label: "CTAs" },
    { id: "footer", label: "Footer" },
    { id: "seo", label: "SEO" },
    { id: "advanced", label: "Advanced" },
  ];

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-start gap-3 p-4 bg-info/10 border border-info/50 rounded-lg">
        <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
        <div className="text-sm text-info">
          All values here control what appears on the website. Update them to
          immediately reflect across the site (no redeploy needed).
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-ink">Global Settings</h2>
        <p className="text-sm text-ink-mute mt-1">
          Manage all company information, contact details, and website
          configuration
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-line overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "text-ink border-b-2 border-info"
                : "text-ink-mute hover:text-ink-soft"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-paper border border-line rounded-xl p-6 space-y-6"
      >
        {/* COMPANY TAB */}
        {activeTab === "company" && (
          <>
            <SectionHeader
              title="Company Identity"
              description="Basic company information"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Company Name"
                value={data?.companyName}
                onChange={(e: any) =>
                  setData({ ...data, companyName: e.target.value })
                }
                required
              />
              <InputField
                label="Founded Year"
                type="number"
                value={data?.foundedYear}
                onChange={(e: any) =>
                  setData({ ...data, foundedYear: parseInt(e.target.value) })
                }
              />
              <InputField
                label="Years of Experience"
                type="number"
                value={data?.yearsExperience}
                onChange={(e: any) =>
                  setData({
                    ...data,
                    yearsExperience: parseInt(e.target.value),
                  })
                }
              />
              <InputField
                label="Total Projects Completed"
                type="number"
                value={data?.totalProjects}
                onChange={(e: any) =>
                  setData({ ...data, totalProjects: parseInt(e.target.value) })
                }
              />
              <div className="md:col-span-2">
                <InputField
                  label="Company Tagline"
                  value={data?.companyTagline}
                  onChange={(e: any) =>
                    setData({ ...data, companyTagline: e.target.value })
                  }
                  placeholder="e.g., 'Building Legacy, Engineering Trust'"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-ink-mute uppercase tracking-wider mb-2">
                  Company Description
                </label>
                <textarea
                  className="w-full px-4 py-2 bg-paper border border-line rounded-lg text-ink text-sm focus:border-info focus:outline-none transition-colors"
                  rows={3}
                  value={data?.companyDescription || ""}
                  onChange={(e) =>
                    setData({ ...data, companyDescription: e.target.value })
                  }
                  placeholder="Brief company description"
                />
              </div>
            </div>
          </>
        )}

        {/* CONTACT TAB */}
        {activeTab === "contact" && (
          <>
            <SectionHeader
              title="Contact Information"
              description="Phone and email (SINGLE SOURCE OF TRUTH - all pages use these values)"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Primary Phone"
                value={data?.primaryPhone}
                onChange={(e: any) =>
                  setData({ ...data, primaryPhone: e.target.value })
                }
                required
                placeholder="+91 93248 77493"
              />
              <InputField
                label="Alternate Phone"
                value={data?.alternatePhone}
                onChange={(e: any) =>
                  setData({ ...data, alternatePhone: e.target.value })
                }
                placeholder="+91 XXXXXXXXXX"
              />
              <InputField
                label="WhatsApp Number"
                value={data?.whatsappNumber}
                onChange={(e: any) =>
                  setData({ ...data, whatsappNumber: e.target.value })
                }
                placeholder="+91 93248 77493"
              />
              <InputField
                label="Office Phone"
                value={data?.officePhone}
                onChange={(e: any) =>
                  setData({ ...data, officePhone: e.target.value })
                }
              />
              <InputField
                label="Business Email"
                type="email"
                value={data?.businessEmail}
                onChange={(e: any) =>
                  setData({ ...data, businessEmail: e.target.value })
                }
                required
              />
              <InputField
                label="Support Email"
                type="email"
                value={data?.supportEmail}
                onChange={(e: any) =>
                  setData({ ...data, supportEmail: e.target.value })
                }
              />
            </div>

            <SectionHeader title="Office Location" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <InputField
                  label="Office Address"
                  value={data?.officeAddress}
                  onChange={(e: any) =>
                    setData({ ...data, officeAddress: e.target.value })
                  }
                  required
                  placeholder="Full office address"
                />
              </div>
              <InputField
                label="City"
                value={data?.city}
                onChange={(e: any) =>
                  setData({ ...data, city: e.target.value })
                }
              />
              <InputField
                label="State"
                value={data?.state}
                onChange={(e: any) =>
                  setData({ ...data, state: e.target.value })
                }
              />
              <InputField
                label="Postal Code"
                value={data?.postalCode}
                onChange={(e: any) =>
                  setData({ ...data, postalCode: e.target.value })
                }
              />
              <InputField
                label="Country"
                value={data?.country}
                onChange={(e: any) =>
                  setData({ ...data, country: e.target.value })
                }
              />
              <div className="md:col-span-2">
                <InputField
                  label="Google Maps Embed URL"
                  value={data?.mapEmbedUrl}
                  onChange={(e: any) =>
                    setData({ ...data, mapEmbedUrl: e.target.value })
                  }
                  placeholder="Google Maps iframe embed code"
                />
              </div>
            </div>
          </>
        )}

        {/* SOCIAL TAB */}
        {activeTab === "social" && (
          <>
            <SectionHeader title="Social Media Links" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Instagram"
                value={data?.socialLinks?.instagram}
                onChange={(e: any) =>
                  setData({
                    ...data,
                    socialLinks: {
                      ...data.socialLinks,
                      instagram: e.target.value,
                    },
                  })
                }
                placeholder="https://instagram.com/..."
              />
              <InputField
                label="LinkedIn"
                value={data?.socialLinks?.linkedin}
                onChange={(e: any) =>
                  setData({
                    ...data,
                    socialLinks: {
                      ...data.socialLinks,
                      linkedin: e.target.value,
                    },
                  })
                }
                placeholder="https://linkedin.com/company/..."
              />
              <InputField
                label="Facebook"
                value={data?.socialLinks?.facebook}
                onChange={(e: any) =>
                  setData({
                    ...data,
                    socialLinks: {
                      ...data.socialLinks,
                      facebook: e.target.value,
                    },
                  })
                }
                placeholder="https://facebook.com/..."
              />
              <InputField
                label="Twitter"
                value={data?.socialLinks?.twitter}
                onChange={(e: any) =>
                  setData({
                    ...data,
                    socialLinks: {
                      ...data.socialLinks,
                      twitter: e.target.value,
                    },
                  })
                }
                placeholder="https://twitter.com/..."
              />
              <div className="md:col-span-2">
                <InputField
                  label="Website URL"
                  value={data?.website}
                  onChange={(e: any) =>
                    setData({ ...data, website: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
          </>
        )}

        {/* BUSINESS HOURS TAB */}
        {activeTab === "business" && (
          <>
            <SectionHeader title="Business Hours" />
            <div className="space-y-3">
              {[
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
              ].map((day) => (
                <div
                  key={day}
                  className="flex items-end gap-3 p-3 bg-raise rounded-lg"
                >
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-ink-mute tracking-wider mb-1 capitalize">
                      {day}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="time"
                        className="flex-1 px-3 py-2 bg-paper border border-line rounded text-ink text-sm"
                        value={data?.businessHours?.[day]?.open || "10:00"}
                        onChange={(e) =>
                          setData({
                            ...data,
                            businessHours: {
                              ...data.businessHours,
                              [day]: {
                                ...data.businessHours[day],
                                open: e.target.value,
                              },
                            },
                          })
                        }
                        disabled={!data?.businessHours?.[day]?.isOpen}
                      />
                      <span className="text-ink-mute text-sm">-</span>
                      <input
                        type="time"
                        className="flex-1 px-3 py-2 bg-paper border border-line rounded text-ink text-sm"
                        value={data?.businessHours?.[day]?.close || "18:00"}
                        onChange={(e) =>
                          setData({
                            ...data,
                            businessHours: {
                              ...data.businessHours,
                              [day]: {
                                ...data.businessHours[day],
                                close: e.target.value,
                              },
                            },
                          })
                        }
                        disabled={!data?.businessHours?.[day]?.isOpen}
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data?.businessHours?.[day]?.isOpen || false}
                      onChange={(e) =>
                        setData({
                          ...data,
                          businessHours: {
                            ...data.businessHours,
                            [day]: {
                              ...data.businessHours[day],
                              isOpen: e.target.checked,
                            },
                          },
                        })
                      }
                      className="w-4 h-4 rounded border-line"
                    />
                    <span className="text-xs text-ink-mute">Open</span>
                  </label>
                </div>
              ))}
            </div>
          </>
        )}

        {/* CTA TAB */}
        {activeTab === "cta" && (
          <>
            <SectionHeader title="Primary Call-to-Action" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <InputField
                  label="CTA Button Text"
                  value={data?.primaryCTA?.text}
                  onChange={(e: any) =>
                    setData({
                      ...data,
                      primaryCTA: { ...data.primaryCTA, text: e.target.value },
                    })
                  }
                  placeholder="e.g., 'Book a Free Site Visit'"
                />
              </div>
              <SelectField
                label="CTA Action"
                value={data?.primaryCTA?.action}
                onChange={(e: any) =>
                  setData({
                    ...data,
                    primaryCTA: { ...data.primaryCTA, action: e.target.value },
                  })
                }
                options={[
                  { value: "scroll", label: "Scroll to Section" },
                  { value: "modal", label: "Open Modal" },
                  { value: "link", label: "External Link" },
                ]}
              />
              <InputField
                label="CTA Target (URL or anchor)"
                value={data?.primaryCTA?.target}
                onChange={(e: any) =>
                  setData({
                    ...data,
                    primaryCTA: { ...data.primaryCTA, target: e.target.value },
                  })
                }
                placeholder="#contact or https://..."
              />
            </div>

            <SectionHeader title="Secondary Call-to-Action" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <InputField
                  label="CTA Button Text"
                  value={data?.secondaryCTA?.text}
                  onChange={(e: any) =>
                    setData({
                      ...data,
                      secondaryCTA: {
                        ...data.secondaryCTA,
                        text: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g., 'View Our Projects'"
                />
              </div>
              <SelectField
                label="CTA Action"
                value={data?.secondaryCTA?.action}
                onChange={(e: any) =>
                  setData({
                    ...data,
                    secondaryCTA: {
                      ...data.secondaryCTA,
                      action: e.target.value,
                    },
                  })
                }
                options={[
                  { value: "scroll", label: "Scroll to Section" },
                  { value: "link", label: "Link" },
                ]}
              />
              <InputField
                label="CTA Target"
                value={data?.secondaryCTA?.target}
                onChange={(e: any) =>
                  setData({
                    ...data,
                    secondaryCTA: {
                      ...data.secondaryCTA,
                      target: e.target.value,
                    },
                  })
                }
                placeholder="#portfolio or /projects"
              />
            </div>
          </>
        )}

        {/* FOOTER TAB */}
        {activeTab === "footer" && (
          <>
            <SectionHeader title="Footer Configuration" />
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-ink-mute uppercase tracking-wider mb-2">
                  Copyright Text
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-paper border border-line rounded-lg text-ink text-sm focus:border-info focus:outline-none transition-colors"
                  value={data?.copyrightText || ""}
                  onChange={(e) =>
                    setData({ ...data, copyrightText: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-mute uppercase tracking-wider mb-2">
                  Footer Text
                </label>
                <textarea
                  className="w-full px-4 py-2 bg-paper border border-line rounded-lg text-ink text-sm focus:border-info focus:outline-none transition-colors"
                  rows={2}
                  value={data?.footerText || ""}
                  onChange={(e) =>
                    setData({ ...data, footerText: e.target.value })
                  }
                />
              </div>
              <InputField
                label="Privacy Policy URL"
                value={data?.privacyPolicyUrl}
                onChange={(e: any) =>
                  setData({ ...data, privacyPolicyUrl: e.target.value })
                }
                placeholder="https://..."
              />
              <InputField
                label="Terms of Service URL"
                value={data?.termsOfServiceUrl}
                onChange={(e: any) =>
                  setData({ ...data, termsOfServiceUrl: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
          </>
        )}

        {/* SEO TAB */}
        {activeTab === "seo" && (
          <>
            <SectionHeader title="SEO Configuration" />
            <div className="space-y-5">
              <InputField
                label="Default Page Title"
                value={data?.seoDefaultTitle}
                onChange={(e: any) =>
                  setData({ ...data, seoDefaultTitle: e.target.value })
                }
              />
              <div>
                <label className="block text-xs font-semibold text-ink-mute uppercase tracking-wider mb-2">
                  Default Meta Description
                </label>
                <textarea
                  className="w-full px-4 py-2 bg-paper border border-line rounded-lg text-ink text-sm focus:border-info focus:outline-none transition-colors"
                  rows={2}
                  value={data?.seoDefaultDescription || ""}
                  onChange={(e) =>
                    setData({ ...data, seoDefaultDescription: e.target.value })
                  }
                />
              </div>
              <InputField
                label="Google Analytics ID"
                value={data?.googleAnalyticsId}
                onChange={(e: any) =>
                  setData({ ...data, googleAnalyticsId: e.target.value })
                }
                placeholder="G-XXXXXXXXXX"
              />
              <InputField
                label="Google Search Console ID"
                value={data?.googleSearchConsoleId}
                onChange={(e: any) =>
                  setData({ ...data, googleSearchConsoleId: e.target.value })
                }
              />
            </div>
          </>
        )}

        {/* ADVANCED TAB */}
        {activeTab === "advanced" && (
          <>
            <SectionHeader title="Advanced Settings" />
            <div className="space-y-4">
              <CheckboxField
                label="Website is Live"
                checked={data?.isLive}
                onChange={(e: any) =>
                  setData({ ...data, isLive: e.target.checked })
                }
              />
              <CheckboxField
                label="Maintenance Mode"
                checked={data?.maintenanceMode}
                onChange={(e: any) =>
                  setData({ ...data, maintenanceMode: e.target.checked })
                }
              />
              {data?.maintenanceMode && (
                <InputField
                  label="Maintenance Message"
                  value={data?.maintenanceMessage}
                  onChange={(e: any) =>
                    setData({ ...data, maintenanceMessage: e.target.value })
                  }
                  placeholder="We're temporarily down for maintenance..."
                />
              )}
              <CheckboxField
                label="Notify on New Lead"
                checked={data?.notifyOnNewLead}
                onChange={(e: any) =>
                  setData({ ...data, notifyOnNewLead: e.target.checked })
                }
              />
              {data?.notifyOnNewLead && (
                <InputField
                  label="Lead Notification Email"
                  type="email"
                  value={data?.leadNotificationEmail}
                  onChange={(e: any) =>
                    setData({ ...data, leadNotificationEmail: e.target.value })
                  }
                  placeholder="sales@example.com"
                />
              )}
            </div>
          </>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-6 border-t border-line">
          <button
            type="button"
            onClick={() => fetchSettings()}
            className="px-6 py-2 text-ink border border-line rounded-lg font-bold text-sm hover:bg-paper transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-info text-white rounded-lg font-bold text-sm hover:bg-info disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
