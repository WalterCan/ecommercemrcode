import { render, screen } from 'test-cleanup';
import { describe, it, expect } from 'vitest';
import StockBadge from './StockBadge';

describe('StockBadge Component', () => {
    it('should render OK status when stock is high', () => {
        render(<StockBadge stock={20} />);

        const badge = screen.getByText(/20/);
        expect(badge).toBeInTheDocument();
        expect(screen.getByText(/OK/)).toBeInTheDocument();
    });

    it('should render Low status when stock is between critical and min', () => {
        render(<StockBadge stock={5} stockMinimo={10} stockCritico={3} />);

        expect(screen.getByText(/Bajo/)).toBeInTheDocument();
    });

    it('should render Critical status when stock is very low', () => {
        render(<StockBadge stock={1} stockCritico={3} />);

        expect(screen.getByText(/Crítico/)).toBeInTheDocument();
    });

    it('should respect custom thresholds', () => {
        // Stock 5 should be critical if critical threshold is 6
        render(<StockBadge stock={5} stockCritico={6} />);

        expect(screen.getByText(/Crítico/)).toBeInTheDocument();
    });
});
