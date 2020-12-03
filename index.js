const fs = require('fs');
const path = require('path');
const {PluginKind, declareClassPlugin, commonTokens, tokens} = require('@stryker-mutator/api/plugin');
const {calculateMetrics} = require('mutation-testing-metrics');

const DEFAULT_BASE_FOLDER = path.normalize('reports/mutation/badge');
const REPORTER_NAME = 'badge-reporter';
const BADGE_LABEL = 'mutation score';
const YELLOW = '#dfb317', GREEN = '#97ca00', RED = '#e04444';
const OKAY_SCORE = 65;
const GOOD_SCORE = 75;

/**
 * This reporter creates an SVG badge.
 * The badge shows the mutation score and adapts it's color to it.
 */
class BadgeReporter {

    static inject = tokens(commonTokens.options, commonTokens.logger);

    constructor(options, logger) {
        this.options = options;
        this.log = logger;
    }

    getBaseDir() {
        if (this.options.badgeReporter && this.options.badgeReporter.baseDir) {
            this.log.debug(`Using configured output folder ${this.options.badgeReporter.baseDir}`);
            return this.options.badgeReporter.baseDir;
        } else {
            this.log.debug(
                `No base folder configuration found (using configuration: badgeReporter: { baseDir: 'output/folder' }), using default ${DEFAULT_BASE_FOLDER}`
            );
            return DEFAULT_BASE_FOLDER;
        }
    }

    onMutationTestReportReady(report) {
        const mutationScore = calculateMetrics(report.files).metrics.mutationScore;
        let badgeColor = this.getColorBasedOnScore(mutationScore);
        const badgeSVG = createBadge(BADGE_LABEL, `${Math.floor(mutationScore)}%`, badgeColor);
        let baseDir = this.getBaseDir();
        const badgePath = path.resolve(baseDir, 'badge.svg');
        fs.mkdirSync(baseDir, { recursive: true });
        fs.writeFileSync(badgePath, badgeSVG);
        this.log.info(`Your badge can be found at: ${badgePath}`);
    }

    getColorBasedOnScore(mutationScore) {
        if (mutationScore > GOOD_SCORE) {
            return GREEN;
        } else if (mutationScore > OKAY_SCORE) {
            return YELLOW;
        }
        return RED;
    }
}

function createBadge(label, value, color) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="20" role="img" aria-label="${label}: ${value}">
    <title>${label}: ${value}</title>
    <linearGradient id="s" x2="0" y2="100%">
        <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
        <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <clipPath id="r">
        <rect width="128" height="20" rx="3" fill="#fff"/>
    </clipPath>
    <g clip-path="url(#r)">
        <rect width="93" height="20" fill="#555"/>
        <rect x="93" width="35" height="20" fill="${color}"/>
        <rect width="128" height="20" fill="url(#s)"/>
    </g>
    <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
       text-rendering="geometricPrecision" font-size="110">
        <text aria-hidden="true" x="475" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)"
              textLength="830">${label}
        </text>
        <text x="475" y="140" transform="scale(.1)" fill="#fff" textLength="830">mutation score</text>
        <text aria-hidden="true" x="1095" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)"
              textLength="250">${value}
        </text>
        <text x="1095" y="140" transform="scale(.1)" fill="#fff" textLength="250">${value}</text>
    </g>
</svg>`;
}

module.exports = {
    strykerPlugins: [
        declareClassPlugin(PluginKind.Reporter, REPORTER_NAME, BadgeReporter)
    ]
}
