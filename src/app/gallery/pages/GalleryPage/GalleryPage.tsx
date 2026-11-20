import type { FC } from 'react';
import ErrorFallback from '@/shared/components/ErrorFallback/ErrorFallback';
import ErrorMessage from '@/shared/components/ErrorMessage/ErrorMessage';
import Spinner from '@/shared/components/Spinner/Spinner';

// Classes are written out in full: Tailwind only generates the ones it finds as literal text.
const colorTokens = [
  { name: 'bg', className: 'bg-bg' },
  { name: 'surface', className: 'bg-surface' },
  { name: 'surface-muted', className: 'bg-surface-muted' },
  { name: 'ink', className: 'bg-ink' },
  { name: 'ink-muted', className: 'bg-ink-muted' },
  { name: 'line', className: 'bg-line' },
  { name: 'control-border', className: 'bg-control-border' },
  { name: 'primary', className: 'bg-primary' },
  { name: 'primary-hover', className: 'bg-primary-hover' },
  { name: 'primary-soft', className: 'bg-primary-soft' },
  { name: 'primary-tint', className: 'bg-primary-tint' },
  { name: 'on-primary', className: 'bg-on-primary' },
  { name: 'income', className: 'bg-income' },
  { name: 'income-soft', className: 'bg-income-soft' },
  { name: 'income-surface', className: 'bg-income-surface' },
  { name: 'credit', className: 'bg-credit' },
  { name: 'credit-soft', className: 'bg-credit-soft' },
  { name: 'error', className: 'bg-error' },
  { name: 'error-soft', className: 'bg-error-soft' },
  { name: 'overlay', className: 'bg-overlay' },
] as const;

const textTokens = [
  { name: 'display', className: 'text-display' },
  { name: 'title', className: 'text-title' },
  { name: 'heading', className: 'text-heading' },
  { name: 'body-strong', className: 'text-body-strong' },
  { name: 'body', className: 'text-body' },
  { name: 'caption', className: 'text-caption' },
  { name: 'small', className: 'text-small' },
] as const;

const radiusTokens = [
  { name: 'sm', className: 'rounded-sm' },
  { name: 'md', className: 'rounded-md' },
  { name: 'lg', className: 'rounded-lg' },
  { name: 'xl', className: 'rounded-xl' },
  { name: 'pill', className: 'rounded-pill' },
] as const;

const shadowTokens = [
  { name: 'card', className: 'shadow-card' },
  { name: 'raised', className: 'shadow-raised' },
  { name: 'fab', className: 'shadow-fab' },
  { name: 'modal', className: 'shadow-modal' },
] as const;

const GalleryPage: FC = () => (
  <div className='flex flex-col gap-10 text-ink'>
    <h1 className='text-title'>Galería de componentes</h1>

    <section aria-labelledby='gallery-tokens' className='flex flex-col gap-6'>
      <h2 id='gallery-tokens' className='text-heading'>
        Tokens
      </h2>

      <div className='flex flex-col gap-2'>
        <h3 className='text-body-strong'>Colores</h3>
        <ul className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
          {colorTokens.map(({ name, className }) => (
            <li key={name} className='flex flex-col gap-1'>
              <div className={`h-12 rounded-md border border-line ${className}`} />
              <span className='text-caption'>{name}</span>
              <code className='text-small text-ink-muted'>{className}</code>
            </li>
          ))}
        </ul>
      </div>

      <div className='flex flex-col gap-2'>
        <h3 className='text-body-strong'>Estilos de texto</h3>
        <ul className='flex flex-col gap-3'>
          {textTokens.map(({ name, className }) => (
            <li key={name} className='flex flex-col'>
              <p className={className}>Gasto en supermercado</p>
              <p className='text-small text-ink-muted'>
                <span>{name}</span> · <code>{className}</code>
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className='flex flex-col gap-2'>
        <h3 className='text-body-strong'>Radios</h3>
        <ul className='flex flex-wrap gap-4'>
          {radiusTokens.map(({ name, className }) => (
            <li key={name} className='flex flex-col gap-1'>
              <div className={`h-16 w-24 border border-line bg-surface-muted ${className}`} />
              <span className='text-caption'>{name}</span>
              <code className='text-small text-ink-muted'>{className}</code>
            </li>
          ))}
        </ul>
      </div>

      <div className='flex flex-col gap-2'>
        <h3 className='text-body-strong'>Sombras</h3>
        <ul className='flex flex-wrap gap-6'>
          {shadowTokens.map(({ name, className }) => (
            <li key={name} className='flex flex-col gap-2'>
              <div className={`h-16 w-24 rounded-md bg-surface ${className}`} />
              <span className='text-caption'>{name}</span>
              <code className='text-small text-ink-muted'>{className}</code>
            </li>
          ))}
        </ul>
      </div>
    </section>

    <section aria-labelledby='gallery-spinner' className='flex flex-col gap-2'>
      <h2 id='gallery-spinner' className='text-heading'>
        Spinner
      </h2>
      <Spinner />
    </section>

    <section aria-labelledby='gallery-error-message' className='flex flex-col gap-2'>
      <h2 id='gallery-error-message' className='text-heading'>
        ErrorMessage
      </h2>
      <ErrorMessage message='No se pudieron cargar los movimientos.' />
      <ErrorMessage title='No se pudo guardar' message='Revisa tu conexión e inténtalo de nuevo.' />
    </section>

    <section aria-labelledby='gallery-error-fallback' className='flex flex-col gap-2'>
      <h2 id='gallery-error-fallback' className='text-heading'>
        ErrorFallback
      </h2>
      <ErrorFallback />
    </section>
  </div>
);

export default GalleryPage;
