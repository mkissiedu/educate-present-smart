import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, Users, Target, AlertTriangle, Lightbulb } from 'lucide-react';
import { fetchClassMetrics, fetchSkillMasteryData, fetchStudentRiskData, fetchTrendData, generatePredictiveInsights } from '@/lib/analytics';
import { ClassMetrics, SkillMasteryData, StudentRiskData, TrendData, PredictiveInsight } from '@/lib/analytics';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export function AnalyticsDashboard() {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('30');
  const [metrics, setMetrics] = useState<ClassMetrics | null>(null);
  const [skillData, setSkillData] = useState<SkillMasteryData[]>([]);
  const [riskData, setRiskData] = useState<StudentRiskData[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (selectedClass) {
      loadAnalytics();
    }
  }, [selectedClass, timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [metricsData, skillsData, studentsData, trendsData, insightsData] = await Promise.all([
        fetchClassMetrics(selectedClass),
        fetchSkillMasteryData(selectedClass),
        fetchStudentRiskData(selectedClass),
        fetchTrendData(selectedClass, parseInt(timeRange)),
        generatePredictiveInsights(selectedClass)
      ]);
      
      setMetrics(metricsData);
      setSkillData(skillsData);
      setRiskData(studentsData);
      setTrendData(trendsData);
      setInsights(insightsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };


  const downloadReport = () => {
    const report = {
      class: selectedClass,
      generatedAt: new Date().toISOString(),
      metrics,
      skillMastery: skillData,
      studentsAtRisk: riskData,
      trends: trendData
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const chartConfig = {
    masteryRate: { label: 'Mastery Rate', color: 'hsl(var(--chart-1))' },
    assessmentCount: { label: 'Assessments', color: 'hsl(var(--chart-2))' }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive performance insights and intervention planning</p>
        </div>
        <div className="flex gap-4">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="class-1">Morning Class</SelectItem>
              <SelectItem value="class-2">Afternoon Class</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={downloadReport} disabled={!metrics}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {metrics && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalStudents}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Average Mastery</CardTitle>
                <Target className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.averageMastery}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Skills Assessed</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.skillsAssessed}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Students At Risk</CardTitle>
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{metrics.studentsAtRisk}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mastery Trends</CardTitle>
                <CardDescription>Performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="masteryRate" stroke="var(--color-masteryRate)" strokeWidth={2} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 10 Skills by Mastery</CardTitle>
                <CardDescription>Most mastered skills in class</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={skillData.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="skillName" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="masteryRate" fill="var(--color-masteryRate)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Students Needing Support</CardTitle>
                <CardDescription>Intervention priority list</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskData.filter(s => s.riskLevel !== 'low').slice(0, 8).map(student => (
                    <div key={student.studentId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={student.riskLevel === 'high' ? 'destructive' : 'secondary'}>
                          {student.riskLevel}
                        </Badge>
                        <span className="font-medium">{student.studentName}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {student.skillsMastered}/{student.skillsAssessed}
                        </span>
                        <Progress value={student.masteryRate} className="w-24" />
                        <span className="text-sm font-medium w-12 text-right">{student.masteryRate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills Needing Focus</CardTitle>
                <CardDescription>Lowest mastery rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skillData.slice(-8).reverse().map(skill => (
                    <div key={skill.skillId} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{skill.skillName}</span>
                        <span className="text-sm text-muted-foreground">{skill.masteryRate}%</span>
                      </div>
                      <Progress value={skill.masteryRate} />
                      <span className="text-xs text-muted-foreground">
                        {skill.masteryCount}/{skill.totalAssessed} students mastered
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Predictive Insights & Intervention Recommendations
                </CardTitle>
                <CardDescription>AI-powered analysis for proactive teaching strategies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <Alert key={index} variant={insight.type === 'warning' ? 'destructive' : 'default'}>
                      <AlertTitle className="flex items-center justify-between">
                        <span>{insight.title}</span>
                        {insight.studentsAffected && (
                          <Badge variant="outline">{insight.studentsAffected} students</Badge>
                        )}
                      </AlertTitle>
                      <AlertDescription>
                        <p className="mb-3">{insight.description}</p>
                        <div className="space-y-1">
                          <p className="font-semibold text-sm">Recommended Actions:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {insight.actionItems.map((action, i) => (
                              <li key={i}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
         </>
      )}
    </div>

  );
}
