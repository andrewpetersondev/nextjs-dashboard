/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Page from '@/src/app/page'

describe('Page', () => {
    it('renders the AcmeLogo component', () => {
        render(<Page />)

        const logo = screen.getByText('Acme Logo')

        expect(logo).toBeInTheDocument()
    })

    it('renders a login link', () => {
        render(<Page />)

        const loginLink = screen.getByRole('link', { name: /log in/i })

        expect(loginLink).toBeInTheDocument()
    })
})