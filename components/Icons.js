const base = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export const SearchIcon = () => (<svg {...base}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>);
export const UserIcon = () => (<svg {...base}><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></svg>);
export const HeartIcon = () => (<svg {...base}><path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z" /></svg>);
export const CartIcon = () => (<svg {...base}><path d="M3 4h2l2.4 11h11l2-8H6.2" /><circle cx="9" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" /></svg>);
export const Logo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
    <path d="M20 36V20M20 20c0-6-5-8-5-14M20 20c0-5 6-7 6-13M20 26c-4-1-8-4-9-9M20 26c4-1 8-3 10-8" />
  </svg>
);
export const perkIcons = {
  deals: 'M20 12l-8 8-9-9V3h8l9 9zM7.5 7.5h.01',
  points: 'M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7c-2-4-6-4-6-1s6 1 6 1zm0 0c2-4 6-4 6-1s-6 1-6 1z',
  returns: 'M3 12a9 9 0 1 0 3-6.7M3 4v5h5',
  experts: 'M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v5H4zM17 14h3v5h-3z',
};
