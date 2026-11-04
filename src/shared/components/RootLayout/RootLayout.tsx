import type { FC, ReactNode } from 'react';
import { NavLink } from 'react-router';

export interface NavItem {
  label: string;
  to: string;
}

interface RootLayoutProps {
  appName: string;
  navItems: NavItem[];
  children: ReactNode;
}

const RootLayout: FC<RootLayoutProps> = ({ appName, navItems, children }) => (
  <>
    <header className='flex items-center gap-6 border-b border-slate-200 px-4 py-3'>
      <span className='text-lg font-bold text-sky-600'>{appName}</span>
      <nav aria-label='Principal'>
        <ul className='flex gap-4'>
          {navItems.map(({ label, to }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  isActive ? 'font-semibold text-sky-700' : 'text-slate-600 hover:text-sky-600'
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
    <main className='p-4'>{children}</main>
  </>
);

export default RootLayout;
