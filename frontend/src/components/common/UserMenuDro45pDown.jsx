// components/navbar/UserMenuDropdown.jsx
import { useEffect, useRef, useCallback, useState } from 'react';
import { Heart, Clock, XCircle, User, LogOut, ChevronDown } from 'lucide-react';

// ─── MenuItem ───────────────────────────────────────────────────────────────
function MenuItem({ icon: Icon, label, badge, destructive, onClick, index }) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      tabIndex={0}
      style={{ animationDelay: `${index * 40}ms` }}
      className={`
        group w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
        transition-all duration-200 ease-out outline-none
        animate-slide-in
        ${destructive
          ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 focus-visible:ring-red-400'
          : 'text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-white/5 focus-visible:ring-orange-400'
        }
        focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900
      `}
    >
      <span className={`
        flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-colors duration-200
        ${destructive
          ? 'bg-red-50 dark:bg-red-500/10 text-red-500 group-hover:bg-red-100 dark:group-hover:bg-red-500/20'
          : 'bg-orange-50 dark:bg-white/5 text-orange-500 group-hover:bg-orange-100 dark:group-hover:bg-white/10'
        }
      `}>
        <Icon size={15} strokeWidth={2} />
      </span>

      <span className="flex-1 text-left">{label}</span>

      {badge != null && badge > 0 && (
        <span
          aria-label={`${badge} notifications`}
          className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full
            text-[10px] font-bold bg-orange-500 text-white leading-none"
        >
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
function Avatar({ user, size = 'md' }) {
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
  };

  return (
    <span
      aria-hidden="true"
      className={`
        ${sizes[size]} flex-shrink-0 rounded-full flex items-center justify-center
        bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold
        ring-2 ring-white dark:ring-gray-800 shadow-md
      `}
    >
      {user?.avatar
        ? <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-full" />
        : initials
      }
    </span>
  );
}

// ─── UserMenuDropdown ────────────────────────────────────────────────────────
export default function UserMenuDropdown({ user, bookingCount = 0, onLogout, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const firstItemRef = useRef(null);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

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

  // Close on Escape, arrow-key navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') {
        close();
        triggerRef.current?.focus();
        return;
      }
      if (!['ArrowDown', 'ArrowUp', 'Tab'].includes(e.key)) return;

      const items = Array.from(menuRef.current?.querySelectorAll('[role="menuitem"]') ?? []);
      const idx = items.indexOf(document.activeElement);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        items[(idx + 1) % items.length]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        items[(idx - 1 + items.length) % items.length]?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  // Focus first item on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstItemRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleItem = useCallback((action) => {
    close();
    triggerRef.current?.focus();
    action?.();
  }, [close]);

  const MENU_ITEMS = [
    { icon: Heart,    label: 'Favourite',        action: () => onNavigate?.('/favourites') },
    { icon: Clock,    label: 'Booking History',  action: () => onNavigate?.('/bookings'),   badge: bookingCount },
    { icon: XCircle,  label: 'Cancel Booking',   action: () => onNavigate?.('/cancel') },
    { icon: User,     label: 'Account',           action: () => onNavigate?.('/account') },
    { icon: LogOut,   label: 'Logout',            action: onLogout,  destructive: true },
  ];

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        ref={triggerRef}
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="User account menu"
        className={`
          flex items-center gap-2 rounded-xl px-2 py-1.5
          transition-all duration-200 outline-none
          hover:bg-white/10 dark:hover:bg-white/10
          focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
          ${isOpen ? 'bg-white/10' : ''}
        `}
      >
        <Avatar user={user} size="md" />
        <span className="hidden lg:flex flex-col items-start leading-tight max-w-[120px]">
          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate w-full">
            {user?.name ?? 'Account'}
          </span>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate w-full">
            {user?.role ?? 'Member'}
          </span>
        </span>
        <ChevronDown
          size={14}
          className={`hidden lg:block text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown panel */}
      <div
        ref={menuRef}
        role="menu"
        aria-label="User menu"
        aria-orientation="vertical"
        inert={!isOpen ? '' : undefined}
        className={`
          absolute right-0 top-full mt-2 w-64 z-50
          origin-top-right
          transition-all duration-200 ease-out
          ${isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
          }
        `}
      >
        {/* Card */}
        <div className="
          rounded-2xl overflow-hidden
          bg-white dark:bg-gray-900
          border border-gray-100 dark:border-white/10
          shadow-[0_8px_40px_-8px_rgba(0,0,0,0.18)]
          dark:shadow-[0_8px_40px_-8px_rgba(0,0,0,0.6)]
        ">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/5 border-b border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-3">
              <Avatar user={user} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user?.name ?? 'Guest User'}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                  {user?.email ?? ''}
                </p>
              </div>
              {user?.role && (
                <span className="ml-auto flex-shrink-0 text-[10px] font-bold uppercase tracking-wider
                  bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400
                  px-2 py-0.5 rounded-full">
                  {user.role}
                </span>
              )}
            </div>
          </div>

          {/* Menu items */}
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

      {/* Keyframe for item entrance */}
      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.22s ease-out both;
        }
      `}</style>
    </div>
  );
}
