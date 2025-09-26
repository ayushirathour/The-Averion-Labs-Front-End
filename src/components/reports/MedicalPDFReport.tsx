import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    padding: 15,
    lineHeight: 1.6,
    color: '#333333',
    width: '100%',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c5aa0',
    textAlign: 'center',
    marginBottom: 20,
    borderBottom: '2px solid #2c5aa0',
    paddingBottom: 15,
  },
  section: {
    marginBottom: 15,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginBottom: 10,
    borderBottom: '1px solid #e0e0e0',
    paddingBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#495057',
    width: '45%',
  },
  infoValue: {
    color: '#333333',
    width: '55%',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  statCard: {
    border: '1px solid #e9ecef',
    borderRadius: 6,
    padding: 10,
    width: '45%',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 9,
    color: '#666666',
    textAlign: 'center',
  },
  disclaimer: {
    backgroundColor: '#fff3e0',
    border: '1px solid #ffcc02',
    borderRadius: 6,
    padding: 12,
    marginTop: 20,
  },
  disclaimerTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#f57c00',
    marginBottom: 6,
  },
  disclaimerText: {
    fontSize: 9,
    color: '#bf360c',
    lineHeight: 1.3,
  },
});

export const MedicalPDFReport: React.FC<{ data: any }> = ({ data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>AVERION LABS MEDICAL REPORT</Text>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Patient Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Patient Name:</Text>
            <Text style={styles.infoValue}>{data.user.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{data.user.email}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Patient ID:</Text>
            <Text style={styles.infoValue}>{data.user.username}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Analysis Summary</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{data.statistics.total_predictions}</Text>
              <Text style={styles.statLabel}>Total Analyses</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{data.user.credits}</Text>
              <Text style={styles.statLabel}>Available Credits</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{data.statistics.this_week_predictions}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{data.statistics.credits_used}</Text>
              <Text style={styles.statLabel}>Credits Used</Text>
            </View>
          </View>
        </View>

        {data.currentAnalysis && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>
                {data.currentAnalysis.type === 'batch' ? 'Batch Analysis Results' : 'Single Analysis Result'}
              </Text>
              
              {data.currentAnalysis.type === 'single' ? (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Filename:</Text>
                    <Text style={styles.infoValue}>{data.currentAnalysis.data.filename}</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Diagnosis:</Text>
                    <Text style={styles.infoValue}>{data.currentAnalysis.data.diagnosis}</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Confidence:</Text>
                    <Text style={styles.infoValue}>{data.currentAnalysis.data.confidence.toFixed(1)}%</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Model Used:</Text>
                    <Text style={styles.infoValue}>{data.currentAnalysis.data.model_type}</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Batch ID:</Text>
                    <Text style={styles.infoValue}>{data.batchData?.batch_id}</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Total Files:</Text>
                    <Text style={styles.infoValue}>{data.batchData?.total_files}</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Successful:</Text>
                    <Text style={styles.infoValue}>{data.batchData?.successful_predictions}</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Average Confidence:</Text>
                    <Text style={styles.infoValue}>{data.batchData?.average_confidence.toFixed(1)}%</Text>
                  </View>
                </>
              )}
            </View>
          </>
        )}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>⚠️ MEDICAL DISCLAIMER</Text>
          <Text style={styles.disclaimerText}>
            This report contains AI-generated predictions for preliminary screening purposes only.
            These results should NOT be used as a substitute for professional medical diagnosis,
            treatment, or advice. Always consult qualified healthcare professionals for diagnosis confirmation.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default MedicalPDFReport;
