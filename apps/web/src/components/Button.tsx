interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'px-6 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap';

  const variants = {
    primary: 'bg-gold-600 text-white hover:bg-gold-500 shadow-sm hover:shadow-md',
    secondary: 'bg-dark text-white hover:bg-dark-secondary shadow-sm hover:shadow-md',
    outline: 'border-2 border-gold-600 text-gold-600 hover:bg-gold-50',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}