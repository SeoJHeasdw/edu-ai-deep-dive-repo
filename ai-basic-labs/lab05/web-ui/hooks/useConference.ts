import { useState, useRef, useCallback, useEffect } from 'react';

export interface ConferenceMessage {
  type: string;
  node?: string;
  content?: string;
  status?: string;
  pattern?: string;
  error?: string;
  // 병렬 처리 관련 필드
  is_parallel?: boolean;
  parallel_index?: number;
  parallel_total?: number;
  parallel_nodes?: string[];
  group_title?: string;
  group_description?: string;
  topic?: string;
  completed_nodes?: string[];
  next_node?: string;
  // HITL 관련 필드
  session_id?: string;
  proposal?: string;
  revision_count?: number;
  max_revisions?: number;
}

export interface ConferenceConfig {
  pattern: string;
  topic: string;
  max_rounds?: number;
  num_agents?: number;
  max_revisions?: number;
}

export interface HITLDecision {
  decision: 'approve' | 'revision' | 'reject';
  feedback: string;
}

// 패턴별 메시지 저장 타입
type PatternMessages = {
  [pattern: string]: ConferenceMessage[];
};

export function useConference() {
  const [patternMessages, setPatternMessages] = useState<PatternMessages>({});
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPattern, setCurrentPattern] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);

  // HITL 전용 상태
  const [hitlSessionId, setHitlSessionId] = useState<string | null>(null);
  const [hitlAwaitingInput, setHitlAwaitingInput] = useState(false);
  const [hitlProposal, setHitlProposal] = useState<string>('');
  const [hitlRevisionCount, setHitlRevisionCount] = useState(0);
  const [hitlMaxRevisions, setHitlMaxRevisions] = useState(3);

  const startConference = useCallback((config: ConferenceConfig) => {
    // HITL 패턴인 경우 전용 WebSocket 사용
    if (config.pattern === 'hitl') {
      startHITLSession(config);
      return;
    }

    // 기존 연결 종료
    if (wsRef.current) {
      wsRef.current.close();
    }

    // 현재 패턴 저장
    setCurrentPattern(config.pattern);
    setIsRunning(true);

    // WebSocket 연결
    const ws = new WebSocket('ws://localhost:8000/api/ws/conference');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket 연결됨');
      setIsConnected(true);

      // 회의 설정 전송
      ws.send(JSON.stringify(config));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 메시지 수신:', data);

        // 현재 패턴의 메시지에 추가
        setPatternMessages((prev) => ({
          ...prev,
          [config.pattern]: [...(prev[config.pattern] || []), data]
        }));

        // 완료 또는 에러 시 종료
        if (data.type === 'conference_complete' || data.type === 'error') {
          setIsRunning(false);
        }
      } catch (error) {
        console.error('메시지 파싱 오류:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket 오류:', error);
      setIsRunning(false);
      setPatternMessages((prev) => ({
        ...prev,
        [config.pattern]: [
          ...(prev[config.pattern] || []),
          {
            type: 'error',
            error: 'WebSocket 연결 오류가 발생했습니다',
            status: 'error'
          }
        ]
      }));
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket 연결 종료');
      setIsConnected(false);
      setIsRunning(false);
    };
  }, []);

  // HITL 전용 세션 시작
  const startHITLSession = useCallback((config: ConferenceConfig) => {
    // 기존 연결 종료
    if (wsRef.current) {
      wsRef.current.close();
    }

    // 상태 초기화
    setCurrentPattern('hitl');
    setIsRunning(true);
    setHitlAwaitingInput(false);
    setHitlSessionId(null);
    setHitlProposal('');
    setHitlRevisionCount(0);
    setHitlMaxRevisions(config.max_revisions || 3);

    // HITL 전용 WebSocket 연결
    const ws = new WebSocket('ws://localhost:8000/api/ws/hitl');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ [HITL] WebSocket 연결됨');
      setIsConnected(true);

      // 세션 시작 요청
      ws.send(JSON.stringify({
        action: 'start',
        topic: config.topic,
        max_revisions: config.max_revisions || 3
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 [HITL] 메시지 수신:', data);

        // HITL 특수 메시지 처리
        if (data.type === 'hitl_session_start') {
          setHitlSessionId(data.session_id);
          setHitlMaxRevisions(data.max_revisions || 3);
        }

        if (data.type === 'hitl_awaiting_input') {
          setHitlAwaitingInput(true);
          setHitlProposal(data.proposal || '');
          setHitlRevisionCount(data.revision_count || 0);
          setHitlMaxRevisions(data.max_revisions || 3);
        }

        // 메시지 저장
        setPatternMessages((prev) => ({
          ...prev,
          hitl: [...(prev['hitl'] || []), data]
        }));

        // 완료 또는 에러 시 종료
        if (data.type === 'conference_complete' || data.type === 'error') {
          setIsRunning(false);
          setHitlAwaitingInput(false);
        }
      } catch (error) {
        console.error('[HITL] 메시지 파싱 오류:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ [HITL] WebSocket 오류:', error);
      setIsRunning(false);
      setHitlAwaitingInput(false);
      setPatternMessages((prev) => ({
        ...prev,
        hitl: [
          ...(prev['hitl'] || []),
          {
            type: 'error',
            error: 'HITL WebSocket 연결 오류가 발생했습니다',
            status: 'error'
          }
        ]
      }));
    };

    ws.onclose = () => {
      console.log('🔌 [HITL] WebSocket 연결 종료');
      setIsConnected(false);
      setIsRunning(false);
      setHitlAwaitingInput(false);
    };
  }, []);

  // HITL 결정 제출
  const submitHITLDecision = useCallback((decision: HITLDecision) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('[HITL] WebSocket이 연결되어 있지 않습니다');
      return;
    }

    console.log('📤 [HITL] 결정 전송:', decision);

    // 결정 UI 메시지 추가 (사용자가 결정한 내용)
    const userDecisionMessage: ConferenceMessage = {
      type: 'hitl_user_decision',
      content: `**사용자 결정:** ${decision.decision.toUpperCase()}\n\n${decision.feedback ? `**피드백:** ${decision.feedback}` : ''}`,
      status: 'user_input'
    };

    setPatternMessages((prev) => ({
      ...prev,
      hitl: [...(prev['hitl'] || []), userDecisionMessage]
    }));

    // 대기 상태 해제
    setHitlAwaitingInput(false);

    // 서버로 결정 전송
    wsRef.current.send(JSON.stringify({
      action: 'decision',
      session_id: hitlSessionId,
      decision: decision.decision,
      feedback: decision.feedback
    }));
  }, [hitlSessionId]);

  // 특정 패턴의 메시지 가져오기
  const getMessages = useCallback((pattern: string) => {
    return patternMessages[pattern] || [];
  }, [patternMessages]);

  // 특정 패턴의 메시지 초기화
  const clearMessages = useCallback((pattern: string) => {
    setPatternMessages((prev) => ({
      ...prev,
      [pattern]: []
    }));
    
    // HITL 상태도 초기화
    if (pattern === 'hitl') {
      setHitlSessionId(null);
      setHitlAwaitingInput(false);
      setHitlProposal('');
      setHitlRevisionCount(0);
    }
  }, []);

  // 모든 패턴의 메시지 초기화
  const clearAllMessages = useCallback(() => {
    setPatternMessages({});
    setHitlSessionId(null);
    setHitlAwaitingInput(false);
    setHitlProposal('');
    setHitlRevisionCount(0);
  }, []);

  // 컴포넌트 언마운트 시 연결 종료
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    getMessages,
    clearMessages,
    clearAllMessages,
    isConnected,
    isRunning,
    currentPattern,
    startConference,
    // HITL 전용
    hitlSessionId,
    hitlAwaitingInput,
    hitlProposal,
    hitlRevisionCount,
    hitlMaxRevisions,
    submitHITLDecision
  };
}
