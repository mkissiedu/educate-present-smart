import React, { useState, useEffect } from 'react';
import { fetchSkills } from '../lib/supabase-skills';
import { Skill } from '../types/student';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CLASS_LEVELS } from '@/types/user';

export const SkillsMapViewer: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [domain, setDomain] = useState<'Knowledge' | 'Skills'>('Skills');
  const [classLevel, setClassLevel] = useState('KG 1');

  useEffect(() => {
    loadSkills();
  }, [domain, classLevel]);

  const loadSkills = async () => {
    try {
      const data = await fetchSkills(domain, classLevel);
      setSkills(data);
    } catch (error) {
      console.error('Error loading skills:', error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Skills Map</h2>
      
      <div className="mb-4 flex gap-4">
        <select className="p-2 border rounded" value={classLevel} onChange={(e) => setClassLevel(e.target.value)}>
          {CLASS_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
        </select>
      </div>

      <Tabs value={domain} onValueChange={(v) => setDomain(v as 'Knowledge' | 'Skills')}>
        <TabsList>
          <TabsTrigger value="Skills">Skills Domain</TabsTrigger>
          <TabsTrigger value="Knowledge">Knowledge Domain</TabsTrigger>
        </TabsList>
        
        <TabsContent value={domain} className="mt-6">
          <div className="grid gap-4">
            {skills.map(skill => (
              <Card key={skill.id} className="p-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold">{skill.skill_code}</h3>
                    <p className="text-sm">{skill.skill_name}</p>
                    {skill.description && <p className="text-xs text-gray-600 mt-2">{skill.description}</p>}
                  </div>
                  <span className="text-sm text-gray-500">Unit {skill.unit_number}</span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
