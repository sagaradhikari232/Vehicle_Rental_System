/**
 * UserMenuDropDown.jsx
 * src/components/common/UserMenuDropDown.jsx
 *
 * Backend user object fields (from getCurrentUser / loginUser):
 *   fullname (lowercase n), email, username, avatar, role
 *
 * Props:
 *   user          — user object from AuthContext
 *   bookingCount  — badge on "Booking History"
 *   onLogout      — () => void
 *   onNavigate    — (path: string) => void  ← required, passed from Navbar
 *   isScrolled    — boolean, controls trigger text/hover contrast
 */
import { useEffect, useRef, useCallback, useState, forwardRef } from 'react';
import { Heart, Clock, XCircle, User, LogOut, ChevronDown } from 'lucide-react';

// ─── MenuItem ─────────────────────────────────────────────────────────────────
const MenuItem = forwardRef(function MenuItem(
  { icon: Icon, label, badge, destructive, onClick, index },
  ref
) {
  return (
    <button
      ref={ref}
      role="menuitem"
      onClick={onClick}
      tabIndex={0}
      style={{ animationDelay: `${index * 40}ms` }}
      className={`
        group w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
        transition-all duration-200 ease-out outline-none animate-slide-in
        ${destructive
          ? 'text-red-500 hover:bg-red-50 focus-visible:ring-red-400'
          : 'text-gray-700 hover:bg-orange-50 focus-visible:ring-orange-400'
        }
        focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-white
      `}
    >
      <span className={`
        flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-colors duration-200
        ${destructive
          ? 'bg-red-50 text-red-500 group-hover:bg-red-100'
          : 'bg-orange-50 text-orange-500 group-hover:bg-orange-100'
        }
      `}>
        <Icon size={15} strokeWidth={2} />
      </span>

      <span className="flex-1 text-left">{label}</span>

      {badge != null && badge > 0 && (
        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1
          rounded-full text-[10px] font-bold bg-orange-500 text-white leading-none">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
});

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ user, size = 'md' }) {
  // Backend stores as `fullname` (lowercase n)
  const displayName = user?.fullname ?? user?.username ?? '';
  const initials = displayName
    ? displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-9 h-9 text-sm' };

  return (
    <span className={`
      ${sizes[size]} flex-shrink-0 rounded-full flex items-center justify-center overflow-hidden
      bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold
      ring-2 ring-white shadow-md
    `}>
      {user?.avatar
        ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
        : initials
      }
    </span>
  );
}

// ─── UserMenuDropdown ─────────────────────────────────────────────────────────
export default function UserMenuDropdown({
  user,
  bookingCount = 0,
  onLogout,
  onNavigate,
  isScrolled = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef  = useRef(null);
  const menuRef     = useRef(null);
  const firstItemRef = useRef(null);

  const close  = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((p) => !p), []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (!menuRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) {
        close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, close]);

  // Keyboard: Escape + arrow keys
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') {
        close(); triggerRef.current?.focus(); return;
      }
      if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return;
      const items = Array.from(menuRef.current?.querySelectorAll('[role="menuitem"]') ?? []);
      const idx   = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); items[(idx + 1) % items.length]?.focus(); }
      else                       { e.preventDefault(); items[(idx - 1 + items.length) % items.length]?.focus(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  // Focus first item on open
  useEffect(() => {
    if (isOpen) setTimeout(() => firstItemRef.current?.focus(), 50);
  }, [isOpen]);

  const handleItem = useCallback((action) => {
    close();
    triggerRef.current?.focus();
    action?.();
  }, [close]);

  // Navigation helper — warns if prop missing (catches Navbar wiring bugs early)
  const nav = useCallback((path) => {
    if (typeof onNavigate === 'function') {
      onNavigate(path);
    } else {
      console.warn('UserMenuDropdown: onNavigate prop not provided.');
    }
  }, [onNavigate]);

  const MENU_ITEMS = [
    { icon: Heart,   label: 'Favourites',      action: () => nav('/favourites')  },
    { icon: Clock,   label: 'Booking History', action: () => nav('/bookings'), badge: bookingCount },
    { icon: XCircle, label: 'Cancel Booking',  action: () => nav('/cancel')      },
    { icon: User,    label: 'My Account',      action: () => nav('/account')     },
    { icon: LogOut,  label: 'Logout',          action: onLogout, destructive: true },
  ];

  // Display name from correct backend field
  const displayName = user?.fullname ?? user?.username ?? 'Account';

  return (
    <div className="relative">

      {/* ── Trigger ─────────────────────────────────────────────────────────── */}
      <button
        ref={triggerRef}
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="User account menu"
        className={`
          flex items-center gap-2 rounded-xl px-2 py-1.5
          transition-all duration-200 outline-none
          focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
          ${isScrolled
            ? `hover:bg-gray-100 ${isOpen ? 'bg-gray-100' : ''}`
            : `hover:bg-white/10 ${isOpen ? 'bg-white/10' : ''}`
          }
        `}
      >
        <Avatar user={user} size="md" />

        <span className="hidden lg:flex flex-col items-start leading-tight max-w-[120px]">
          <span className={`text-sm font-semibold truncate w-full transition-colors duration-300 ${
            isScrolled ? 'text-gray-900' : 'text-white'
          }`}>
            {displayName}
          </span>
          <span className={`text-[11px] truncate w-full transition-colors duration-300 ${
            isScrolled ? 'text-gray-500' : 'text-white/70'
          }`}>
            {user?.role ?? 'Member'}
          </span>
        </span>

        <ChevronDown
          size={14}
          className={`hidden lg:block flex-shrink-0 transition-all duration-200 ${
            isScrolled ? 'text-gray-400' : 'text-white/70'
          } ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* ── Dropdown panel ──────────────────────────────────────────────────── */}
      <div
        ref={menuRef}
        role="menu"
        aria-label="User menu"
        aria-orientation="vertical"
        inert={!isOpen ? '' : undefined}
        className={`
          absolute right-0 top-full mt-2 w-64 z-50 origin-top-right
          transition-all duration-200 ease-out
          ${isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
          }
        `}
      >
        <div className="
          rounded-2xl overflow-hidden bg-white
          border border-gray-100
          shadow-[0_8px_40px_-8px_rgba(0,0,0,0.18)]
        ">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Avatar user={user} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                <p className="text-[11px] text-gray-500 truncate">{user?.email ?? ''}</p>
              </div>
              {user?.role && (
                <span className="ml-auto flex-shrink-0 text-[10px] font-bold uppercase tracking-wider
                  bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                  {user.role}
                </span>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="p-2">
            {MENU_ITEMS.map((item, i) => (
              <MenuItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                badge={item.badge}
                destructive={item.destructive}
                index={i}
                onClick={() => handleItem(item.action)}
                ref={i === 0 ? firstItemRef : undefined}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.22s ease-out both; }
      `}</style>
    </div>
  );
}