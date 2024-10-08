import { act, render, waitFor } from '@testing-library/react'
import { LicenseManager } from './LicenseManager'
import { Watermark } from './Watermark'

// Mocking useEditor and licenseContext
jest.mock('../hooks/useEditor', () => ({
	useEditor: () => ({
		getViewportScreenBounds: jest.fn().mockReturnValue({ width: 800 }),
		getInstanceState: jest.fn().mockReturnValue({ isDebugMode: false }),
		menus: {
			hasAnyOpenMenus: jest.fn().mockReturnValue(false),
		},
		getIsMenuOpen: jest.fn().mockReturnValue(false),
		environment: jest.fn().mockReturnValue({
			isSafari: true,
			isIos: false,
			isChromeForIos: false,
			isFirefox: false,
			isAndroid: false,
			isWebview: false,
		}),
	}),
}))

let mockLicenseState = 'unlicensed'
jest.mock('./LicenseProvider', () => ({
	useLicenseContext: jest.fn().mockReturnValue({
		state: { get: () => mockLicenseState },
		async getWatermarkUrl() {
			return ['watermark-desktop.svg', 'watermark-mobile.svg']
		},
	}),
}))

jest.useFakeTimers()

export async function renderComponent() {
	const result = render(<Watermark />)
	jest.advanceTimersByTime(3000)
	return result
}

describe('Watermark', () => {
	beforeEach(() => {
		jest.mock('./LicenseProvider', () => ({
			useLicenseContext: jest.fn().mockReturnValue({ state: { get: () => mockLicenseState } }),
		}))
	})

	it('Displays the watermark when the editor is unlicensed', async () => {
		const result = await act(renderComponent)

		// Don't wanna put a data-testid here - makes it too easy to querySelect on.
		await waitFor(() =>
			expect((result.container.firstChild! as Element)!.nextElementSibling!.className).toBe(
				LicenseManager.className
			)
		)
	})

	it('Displays the watermark when the editor is licensed with watermark', async () => {
		mockLicenseState = 'licensed-with-watermark'
		const result = await act(renderComponent)

		// Don't wanna put a data-testid here - makes it too easy to querySelect on.
		await waitFor(() =>
			expect((result.container.firstChild! as Element)!.nextElementSibling!.className).toBe(
				LicenseManager.className
			)
		)
	})

	it('Does not display the watermark when the editor is licensed', async () => {
		mockLicenseState = 'licensed'
		const result = await renderComponent()
		expect(result.container.firstChild).toBeNull()
	})
})
