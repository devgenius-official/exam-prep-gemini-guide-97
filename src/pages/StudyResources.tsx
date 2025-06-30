
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, FileText, Video, ExternalLink, ArrowLeft, Sparkles, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

interface StudyResource {
  title: string;
  type: 'article' | 'video' | 'practice' | 'reference';
  description: string;
  url?: string;
}

const StudyResources = () => {
  const [searchTopic, setSearchTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [resources, setResources] = useState<StudyResource[]>([]);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const callGeminiAPI = async (prompt: string) => {
    const API_KEY = 'AIzaSyBPWD8VGE4EUqGzsdfP-nLfDV0JNOHdBoM';
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Gemini API');
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  };

  const generateResources = async () => {
    if (!searchTopic) {
      toast.error('Please enter a topic to search for');
      return;
    }

    setIsLoading(true);
    try {
      const prompt = `Generate 6 study resources for the topic "${searchTopic}" in ${subject || 'general studies'}.
      
      Please respond ONLY with a valid JSON array in this format:
      [
        {
          "title": "Resource Title",
          "type": "article",
          "description": "Brief description of the resource"
        },
        {
          "title": "Resource Title",
          "type": "video",
          "description": "Brief description of the resource"
        },
        {
          "title": "Resource Title",
          "type": "practice",
          "description": "Brief description of the resource"
        },
        {
          "title": "Resource Title",
          "type": "reference",
          "description": "Brief description of the resource"
        }
      ]
      
      Mix different types: article, video, practice, reference. Make titles specific and descriptions helpful.`;

      const response = await callGeminiAPI(prompt);
      
      // Clean and parse the response
      let cleanedData = response.trim();
      cleanedData = cleanedData.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      const jsonMatch = cleanedData.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cleanedData = jsonMatch[0];
      }
      
      const parsedResources = JSON.parse(cleanedData);
      setResources(parsedResources);
      toast.success('🤖 AI Study Resources Generated!');
    } catch (error) {
      console.error('Resources generation error:', error);
      toast.error('Failed to generate study resources');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSummary = async () => {
    if (!searchTopic) {
      toast.error('Please enter a topic first');
      return;
    }

    setIsLoading(true);
    try {
      const prompt = `Create a comprehensive study summary for the topic "${searchTopic}" in ${subject || 'general studies'}.
      
      Include:
      1. Key concepts and definitions
      2. Important facts and figures
      3. Common misconceptions
      4. Memory techniques or mnemonics
      5. Practice questions or examples
      
      Format it clearly with sections and bullet points. Keep it concise but comprehensive.`;

      const summaryText = await callGeminiAPI(prompt);
      setSummary(summaryText);
      toast.success('🤖 AI Study Summary Generated!');
    } catch (error) {
      toast.error('Failed to generate study summary');
    } finally {
      setIsLoading(false);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'practice': return <BookOpen className="h-4 w-4" />;
      case 'reference': return <ExternalLink className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'video': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'practice': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'reference': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                📚 AI Study Resources
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Discover personalized study materials with AI! 🤖
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Search Section */}
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-2 border-violet-200 dark:border-violet-700">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Search className="h-6 w-6 text-violet-600" />
              🔍 Resource Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="searchTopic">Topic to Study</Label>
                <Input
                  id="searchTopic"
                  value={searchTopic}
                  onChange={(e) => setSearchTopic(e.target.value)}
                  placeholder="e.g., Quantum Physics, Shakespeare, Linear Algebra"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject Area (Optional)</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Physics, Literature, Mathematics"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={generateResources}
                disabled={isLoading || !searchTopic}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Find Resources
                  </>
                )}
              </Button>
              <Button 
                onClick={generateSummary}
                disabled={isLoading || !searchTopic}
                variant="outline"
                className="bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Summary
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Generated Resources */}
          {resources.length > 0 && (
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  📖 Recommended Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {resources.map((resource, index) => (
                    <div key={index} className="p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg border hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getResourceColor(resource.type)}`}>
                          {getResourceIcon(resource.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{resource.title}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            {resource.description}
                          </p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getResourceColor(resource.type)}`}>
                            {resource.type.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generated Summary */}
          {summary && (
            <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-2 border-green-200 dark:border-green-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  📋 AI Study Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={summary}
                  readOnly
                  className="min-h-[450px] bg-white/80 dark:bg-gray-800/80 text-sm"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyResources;
