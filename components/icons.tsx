import React from 'react';

export const ArrowLeftIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
    </svg>
);

export const RunningIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1"></circle>
    <path d="M12 22L12 15"></path>
    <path d="M12 15L8 12"></path>
    <path d="M12 15L16 12"></path>
    <path d="M4 22L8 12"></path>
    <path d="M20 22L16 12"></path>
  </svg>
);

export const HiitIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
    <line x1="4" y1="22" x2="4" y2="15"></line>
  </svg>
);

export const WalkingIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.5 22a2.5 2.5 0 01-5 0V12H5l4-5 4 5h-2.5v10zM19 12h-2.5l4-5 4 5H22V2a2 2 0 00-2-2h-5a2 2 0 00-2 2v10z"></path>
  </svg>
);

export const YogaIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a5 5 0 00-5 5c0 4.418 4.418 10 5 10s5-5.582 5-10a5 5 0 00-5-5z"></path>
    <path d="M2 14h20"></path><path d="M4 18h16"></path>
  </svg>
);

export const HeartIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
  </svg>
);

export const FlameIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45.385c-.345.678-.597 1.408-.718 2.189a3 3 0 00.358 2.618c.245.362.583.693.992.972.48.328.994.613 1.449.857.36.19.704.343 1.02.473a1 1 0 001.265-1.483 8.37 8.37 0 00-.73-1.042 3.981 3.981 0 00-1.45-1.13c-.35-.16-.72-.293-1.11-.403a4.043 4.043 0 00-1.01-2.235zM8.28 2.633a1 1 0 00-1.56.09l-2 3A1 1 0 006 7.5c.552 0 1-.448 1-1v-1.28l.72.648a1 1 0 001.44-.09l.004-.005a1 1 0 00.12-1.405l-1.004-1.233zM10 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd"></path>
  </svg>
);

export const PaceIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd"></path>
  </svg>
);

export const UserIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

export const DumbbellIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 6V3h2.5A2.5 2.5 0 0117 5.5V8M8 12H5a2.5 2.5 0 00-2.5 2.5V17A2.5 2.5 0 005 19.5h2.5M16 12h3.5a2.5 2.5 0 012.5 2.5V17a2.5 2.5 0 01-2.5 2.5H19M12 18v3H9.5A2.5 2.5 0 017 18.5V16M6 6l12 12"></path>
  </svg>
);

export const OfflineIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 005-5V8a5 5 0 00-5-5h-2a3 3 0 00-3-3H9a3 3 0 00-3 3H4a4 4 0 00-4 4v2"></path>
    <line x1="12" y1="11" x2="12" y2="17"></line><polyline points="8 14 12 17 16 14"></polyline>
  </svg>
);