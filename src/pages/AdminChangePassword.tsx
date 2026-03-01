import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";

const AdminChangePassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.currentPassword.trim()) {
      toast({
        title: "Validation error",
        description: "Current password is required",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!formData.newPassword.trim()) {
      toast({
        title: "Validation error",
        description: "New password is required",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      toast({
        title: "Validation error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Validation error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const result = await adminService.changePassword(
      formData.currentPassword,
      formData.newPassword
    );

    if (result.success) {
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
      navigate("/admin/dashboard");
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to change password",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="max-w-2xl mx-auto px-6 pb-20">
        {/* Header */}
        <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-ink mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-4xl font-black text-ink mb-8">Change Password</h1>

        <div className="border border-rule p-8 rounded-lg bg-card">
          <p className="text-muted-foreground mb-8">
            Enter your current password and your new password to change your account password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-ink"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter your new password (minimum 8 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-ink"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters required
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-ink"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-8 border-t border-rule">
              <Link to="/admin/dashboard">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminChangePassword;
