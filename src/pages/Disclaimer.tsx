import { Link } from 'react-router';

export default function Disclaimer() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-24 pb-24">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite mb-3">Disclaimer</h1>
        <p className="text-sm font-mono text-slategray">Last updated: May 1, 2026</p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-display font-medium text-offwhite mb-3">General Disclaimer</h2>
          <p className="text-offwhite/90 leading-relaxed mb-4">
            The information provided by Sigma Capital ("we," "us," or "our") on sigma-capital.pages.dev (the "Site") is for general informational and educational purposes only. All information on the Site is provided in good faith; however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the Site.
          </p>
          <p className="text-offwhite/90 leading-relaxed">
            Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred as a result of the use of the Site or reliance on any information provided on the Site. Your use of the Site and your reliance on any information on the Site is solely at your own risk.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-display font-medium text-offwhite mb-3">Not Financial Advice</h2>
          <p className="text-offwhite/90 leading-relaxed mb-4">
            The Site contains financial information, market data, news, analysis, and educational content. However, this content should not be construed as financial advice, investment advice, trading advice, or any other sort of advice, and you should not treat any of the Site's content as such. Sigma Capital does not recommend that any security, cryptocurrency, or financial product be bought, sold, or held by you. You should conduct your own due diligence and consult with a qualified financial advisor before making any investment decisions.
          </p>
          <p className="text-offwhite/90 leading-relaxed mb-4">
            Nothing on this Site constitutes a solicitation, recommendation, endorsement, or offer by Sigma Capital or any third-party service provider to buy or sell any securities or other financial instruments. All investments involve risk, including the possible loss of principal. You are solely responsible for determining whether any investment, investment strategy, security, or related transaction is appropriate for you based on your personal investment objectives, financial circumstances, and risk tolerance.
          </p>
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-4">
            <p className="text-amber-400 font-medium text-sm mb-2">Important Warning</p>
            <p className="text-offwhite/90 text-sm leading-relaxed">
              Past performance is not indicative of future results. Historical returns, projections, and estimates are not guarantees of future performance. The value of investments and the income derived from them can go down as well as up, and investors may not recover the amount originally invested.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-display font-medium text-offwhite mb-3">Market Data Disclaimer</h2>
          <p className="text-offwhite/90 leading-relaxed mb-4">
            Market data displayed on the Site, including stock prices, cryptocurrency prices, market indices, yield curves, and economic indicators, may be delayed by 15 minutes or more depending on the data source. This data is provided for informational purposes only and should not be used for real-time trading decisions. Data is sourced from third-party providers and public data sources, and while we make reasonable efforts to ensure accuracy, we cannot guarantee the timeliness, accuracy, or completeness of market data.
          </p>
          <p className="text-offwhite/90 leading-relaxed">
            Cryptocurrency prices are highly volatile and subject to rapid fluctuations. The cryptocurrency market operates 24/7 and prices displayed on the Site may not reflect the most current market conditions. You should verify any pricing information through independent sources before making trading decisions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-display font-medium text-offwhite mb-3">Tool and Calculator Disclaimer</h2>
          <p className="text-offwhite/90 leading-relaxed mb-4">
            The financial tools and calculators provided on the Site, including but not limited to compound interest calculators, retirement score calculators, mortgage calculators, tax-loss harvesting tools, options calculators, and portfolio backtesters, are provided for educational and illustrative purposes only. The results generated by these tools are based on the inputs you provide and certain assumptions that may not reflect actual market conditions, tax laws, or your individual financial situation.
          </p>
          <p className="text-offwhite/90 leading-relaxed">
            These tools do not constitute financial planning or investment advice. The projections, estimates, and calculations generated by these tools are hypothetical in nature and are not guarantees of future results. Actual results may vary significantly from the projections provided by these tools. You should not rely solely on the output of these tools when making financial decisions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-display font-medium text-offwhite mb-3">Third-Party Content Disclaimer</h2>
          <p className="text-offwhite/90 leading-relaxed mb-4">
            The Site may include content from third-party sources, including news articles, market commentary, and data from external providers. The views and opinions expressed in third-party content do not necessarily reflect the views and opinions of Sigma Capital. We do not endorse, verify, or guarantee the accuracy of any third-party content, and we are not responsible for any errors, omissions, or inaccuracies in such content.
          </p>
          <p className="text-offwhite/90 leading-relaxed">
            Any links to third-party websites or services are provided solely as a convenience and do not constitute an endorsement by Sigma Capital. We are not responsible for the content, privacy policies, or practices of any third-party websites or services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-display font-medium text-offwhite mb-3">Risk Disclosure</h2>
          <p className="text-offwhite/90 leading-relaxed mb-4">
            Investing in financial markets, including stocks, bonds, cryptocurrencies, and other financial instruments, involves substantial risk of loss and is not suitable for every investor. The prices of financial instruments can and do fluctuate, and any individual instrument may experience downward price movements that result in partial or total loss of your investment. You should be aware of the following risks:
          </p>
          <ul className="list-disc list-inside space-y-2 text-offwhite/90 leading-relaxed ml-4">
            <li><strong>Market Risk:</strong> The value of your investments may decline due to market conditions, economic factors, or investor sentiment</li>
            <li><strong>Liquidity Risk:</strong> You may not be able to sell your investments quickly or at a fair price when you want to</li>
            <li><strong>Concentration Risk:</strong> Investing heavily in a single asset, sector, or geography increases the impact of adverse events on your portfolio</li>
            <li><strong>Cryptocurrency Risk:</strong> Digital assets are highly speculative, subject to regulatory uncertainty, and may lose all or substantially all of their value</li>
            <li><strong>Leverage Risk:</strong> Using margin, options, or other leveraged strategies can amplify both gains and losses</li>
            <li><strong>Inflation Risk:</strong> The purchasing power of your investments may be eroded over time by inflation</li>
            <li><strong>Regulatory Risk:</strong> Changes in laws or regulations may adversely affect the value or legality of your investments</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-display font-medium text-offwhite mb-3">Forward-Looking Statements</h2>
          <p className="text-offwhite/90 leading-relaxed">
            The Site may contain forward-looking statements, projections, estimates, and forecasts based on current expectations and assumptions about future events. These forward-looking statements are subject to risks, uncertainties, and other factors that could cause actual results to differ materially from those expressed or implied. You should not place undue reliance on forward-looking statements, which speak only as of the date they are made. Sigma Capital undertakes no obligation to update or revise any forward-looking statements, whether as a result of new information, future events, or otherwise.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-display font-medium text-offwhite mb-3">No Fiduciary Relationship</h2>
          <p className="text-offwhite/90 leading-relaxed">
            Your use of the Site does not create a fiduciary, advisory, or agency relationship between you and Sigma Capital. We do not owe you any fiduciary duties, and nothing on the Site should be construed as creating a relationship of trust, confidence, or reliance between you and us. You are solely responsible for your own investment decisions, and you should seek independent professional advice before acting on any information provided on the Site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-display font-medium text-offwhite mb-3">Contact</h2>
          <p className="text-offwhite/90 leading-relaxed">
            If you have any questions about this Disclaimer, please contact us at:
          </p>
          <div className="mt-3 p-4 bg-charcoal border border-subtleborder rounded-xl">
            <p className="text-offwhite/90 font-mono text-sm">Sigma Capital</p>
            <p className="text-offwhite/90 font-mono text-sm">Email: legal@sigmacapital.com</p>
          </div>
        </section>
      </div>

      <div className="mt-16 pt-8 border-t border-subtleborder">
        <Link to="/" className="text-sm font-mono text-emerald hover:text-offwhite transition-colors">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
