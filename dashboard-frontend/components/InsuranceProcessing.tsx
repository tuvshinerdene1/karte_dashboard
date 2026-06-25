'use client';

import { useState, useEffect } from 'react';
import { useHealthcareFlowStore, InsuranceStatus } from '@/store/healthcareFlowStore';
import {
  getInsuranceStatusColor,
  getInsuranceStatusLabel,
  isInsuranceErrorStatus,
  getInsuranceRetryRecommendation,
} from '@/lib/healthcareUtils';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface InsuranceProcessingProps {
  patientId: string;
  patientName: string;
  claimAmount: number;
}

export default function InsuranceProcessing({
  patientId,
  patientName,
  claimAmount,
}: InsuranceProcessingProps) {
  const { insuranceClaims, submitInsuranceClaim, updateInsuranceStatus, retryInsuranceClaim } = useHealthcareFlowStore();
  const [expandedClaimId, setExpandedClaimId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const patientClaims = insuranceClaims.filter((c) => c.patientId === patientId);

  // Simulate insurance processing
  useEffect(() => {
    const checkProcessingClaims = setInterval(() => {
      patientClaims.forEach((claim) => {
        if (claim.status === 'processing' && Math.random() > 0.7) {
          // Simulate various outcomes
          const outcomes: InsuranceStatus[] = [
            'approved',
            'not-found',
            'limit-exceeded',
            'validation-error',
            'server-unavailable',
          ];
          const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
          updateInsuranceStatus(claim.id, randomOutcome);
        }
      });
    }, 5000);

    return () => clearInterval(checkProcessingClaims);
  }, [patientClaims, updateInsuranceStatus]);

  const handleSubmitClaim = () => {
    setIsProcessing(true);
    submitInsuranceClaim(patientId, claimAmount);
    setTimeout(() => setIsProcessing(false), 500);
  };

  const handleRetry = (claimId: string) => {
    retryInsuranceClaim(claimId);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Insurance Processing</h3>
          <p className="text-sm text-gray-600">{patientName}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Claim Amount</p>
          <p className="text-2xl font-bold text-gray-900">₮{claimAmount.toLocaleString()}</p>
        </div>
      </div>

      {patientClaims.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center mb-6">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No insurance claims submitted yet.</p>
          <button
            onClick={handleSubmitClaim}
            disabled={isProcessing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isProcessing ? 'Submitting...' : 'Submit Claim Now'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {patientClaims.map((claim) => {
            const statusColor = getInsuranceStatusColor(claim.status);
            const statusLabel = getInsuranceStatusLabel(claim.status);
            const isError = isInsuranceErrorStatus(claim.status);
            const isExpanded = expandedClaimId === claim.id;
            const timeElapsed = claim.respondedAt
              ? `${Math.floor((claim.respondedAt.getTime() - claim.sentAt.getTime()) / 1000)}s`
              : `${Math.floor((Date.now() - claim.sentAt.getTime()) / 1000)}s`;

            return (
              <div
                key={claim.id}
                className={`border rounded-lg overflow-hidden transition-all ${
                  isError ? 'border-red-200 bg-red-50' : 'border-gray-200'
                }`}
              >
                <button
                  onClick={() => setExpandedClaimId(isExpanded ? null : claim.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {claim.status === 'approved' && (
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    )}
                    {claim.status === 'processing' && (
                      <Clock className="w-5 h-5 text-blue-600 shrink-0 animate-spin" />
                    )}
                    {isError && (
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    )}

                    <div className="text-left min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Claim {claim.id.substring(0, 8)}...
                      </p>
                      <p className="text-xs text-gray-600">
                        Submitted: {claim.sentAt.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                      {statusLabel}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 space-y-3">
                    {/* Claim Details */}
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2">Claim Details</p>
                      <div className="text-xs space-y-1">
                        <p><span className="font-medium">Amount:</span> ₮{claim.claimAmount.toLocaleString()}</p>
                        <p><span className="font-medium">Status:</span> {statusLabel}</p>
                        <p><span className="font-medium">Submitted:</span> {claim.sentAt.toLocaleString()}</p>
                        {claim.respondedAt && (
                          <p><span className="font-medium">Responded:</span> {claim.respondedAt.toLocaleString()}</p>
                        )}
                        <p><span className="font-medium">Processing Time:</span> {timeElapsed}</p>
                        <p><span className="font-medium">Retry Count:</span> {claim.retryCount} / {claim.maxRetries}</p>
                      </div>
                    </div>

                    {/* Error Message */}
                    {isError && claim.errorMessage && (
                      <div className="bg-red-100 border border-red-300 rounded p-2">
                        <p className="text-xs text-red-800">
                          <span className="font-semibold">Error:</span> {claim.errorMessage}
                        </p>
                      </div>
                    )}

                    {/* Recommendation */}
                    {isError && (
                      <div className="bg-blue-100 border border-blue-300 rounded p-2">
                        <p className="text-xs text-blue-800">
                          <span className="font-semibold">Recommendation:</span> {getInsuranceRetryRecommendation(claim.status)}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {claim.status === 'processing' && (
                        <button
                          onClick={() => handleRetry(claim.id)}
                          disabled={claim.retryCount >= claim.maxRetries}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <RotateCw className="w-4 h-4" />
                          Retry
                        </button>
                      )}

                      {isError && claim.retryCount < claim.maxRetries && (
                        <button
                          onClick={() => handleRetry(claim.id)}
                          className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white text-xs font-medium rounded hover:bg-orange-700 transition-colors"
                        >
                          <RotateCw className="w-4 h-4" />
                          Retry ({claim.maxRetries - claim.retryCount} left)
                        </button>
                      )}

                      {claim.retryCount >= claim.maxRetries && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 text-xs font-medium rounded">
                          <AlertCircle className="w-4 h-4" />
                          Max retries exceeded
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {patientClaims.some((c) => c.status !== 'approved') && (
            <button
              onClick={handleSubmitClaim}
              disabled={isProcessing}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors mt-4"
            >
              {isProcessing ? 'Submitting...' : 'Submit New Claim'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
