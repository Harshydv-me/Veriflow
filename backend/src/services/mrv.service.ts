/**
 * MRV (Monitoring, Reporting, Verification) Service
 * Simplified calculations for hackathon demo
 */

interface MRVCalculation {
  estimatedCarbonCredits: number;
  methodology: string;
  factors: {
    area: number;
    ecosystemType: string;
    sequestrationRate: number;
    timeframe: number;
  };
}

export class MRVService {
  // Simplified carbon sequestration rates (tons CO2/hectare/year)
  private static SEQUESTRATION_RATES: { [key: string]: number } = {
    Mangrove: 6.5, // Mangroves are highly effective
    Seagrass: 4.5,
    'Salt Marsh': 5.0,
    Other: 3.0,
  };

  /**
   * Calculate estimated carbon credits based on project data
   * This is a simplified calculation for demo purposes
   */
  static calculateCarbonCredits(
    area: number, // in square meters
    ecosystemType: string,
    timeframeYears: number = 1
  ): MRVCalculation {
    // Convert area to hectares
    const areaInHectares = area / 10000;

    // Get sequestration rate
    const sequestrationRate = this.SEQUESTRATION_RATES[ecosystemType] || this.SEQUESTRATION_RATES.Other;

    // Calculate total carbon credits
    const estimatedCarbonCredits = Math.floor(
      areaInHectares * sequestrationRate * timeframeYears
    );

    return {
      estimatedCarbonCredits,
      methodology: 'Simplified Blue Carbon Standard',
      factors: {
        area: areaInHectares,
        ecosystemType,
        sequestrationRate,
        timeframe: timeframeYears,
      },
    };
  }

  /**
   * Validate field data for MRV compliance
   */
  static validateFieldData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.location || !data.location.latitude || !data.location.longitude) {
      errors.push('GPS location required');
    }

    if (!data.images || (!data.images.before?.length && !data.images.progress?.length)) {
      errors.push('At least one image required');
    }

    if (!data.measurements || Object.keys(data.measurements).length === 0) {
      errors.push('Measurements required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate verification confidence score
   */
  static calculateConfidenceScore(fieldDataCount: number, hasImages: boolean): number {
    let score = 0;

    // Base score from field data submissions
    score += Math.min(fieldDataCount * 20, 60);

    // Bonus for images
    if (hasImages) {
      score += 20;
    }

    // Additional 20 points available for verifier discretion
    score += 20;

    return Math.min(score, 100);
  }
}
