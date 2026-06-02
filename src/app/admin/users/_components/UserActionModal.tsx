import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { User } from "@/types";

interface UserActionModalProps {
  user: User | null;
  action: "activate" | "deactivate" | "make-admin" | "";
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function UserActionModal({
  user,
  action,
  onClose,
  onConfirm,
  isPending,
}: UserActionModalProps) {
  return (
    <Modal
      isOpen={!!user}
      onClose={onClose}
      title="Access Level Configuration"
      size="sm"
    >
      {user && (
        <div className="space-y-5">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Confirm selection for:</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{user.name}</p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            {action === "deactivate" && "Deactivating this profile locks out their account. They will instantly lose print and queue management privileges."}
            {action === "activate" && "Activating this user profile immediately restores all features and dashboard portal accessibility."}
            {action === "make-admin" && "Promoting to administrator gives full database write/delete, printer setup, and financial analytics powers."}
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>
              Go Back
            </Button>
            <Button
              variant={action === "deactivate" ? "danger" : "primary"}
              className="flex-1"
              loading={isPending}
              onClick={onConfirm}
            >
              Confirm
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
