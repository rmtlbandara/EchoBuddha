/**
 * Page-specific reading notes for the existing short quote permalinks.
 * These are original editorial applications, not quotations from Buddhist texts.
 * Keep keys tied to the exact quote; do not select advice by array position.
 */
export type QuoteApplication = {
  interpretation: string;
  application: string;
  question: string;
};

export const QUOTE_APPLICATIONS: Record<string, QuoteApplication> = {
  "A peaceful mind begins with one honest breath.": {
    interpretation: "An honest breath is the ordinary breath you can notice, even when you feel unsettled; peacefulness is an invitation, not a promised result.",
    application: "Before reopening a worrying message, notice one natural exhale without making it deeper. If breath attention feels uncomfortable, look around the room and feel your feet instead.",
    question: "Can you pause without requiring yourself to feel calm first?"
  },
  "Let kindness be the echo you leave in every room.": {
    interpretation: "The echo is what remains in another person's experience after an encounter, rather than the impression you hoped to make.",
    application: "At the end of a meeting or visit, leave one useful thing behind: a clear thank-you, a task completed, or room for someone quieter to speak.",
    question: "What might someone remember about the way you treated them today?"
  },
  "When anger rises, pause long enough to see the pain beneath it.": {
    interpretation: "Anger may protect hurt, fear, or a crossed boundary; looking underneath can clarify the response without excusing harmful behavior.",
    application: "Before sending an angry reply, write the concern in a plain sentence: what happened, what matters, and what needs to change. If there is immediate danger, prioritize getting safe.",
    question: "What concern would still need attention after the anger cooled?"
  },
  "Small acts of attention can turn an ordinary day into a teacher.": {
    interpretation: "An ordinary event teaches when you notice a connection you would usually miss, such as how rushing affects your speech.",
    application: "Watch one familiar transition, perhaps arriving home, and notice what happens just before your usual reaction. Use that observation to make one practical adjustment tomorrow.",
    question: "What did a routine moment show you about a habit?"
  },
  "The path is not far away; it is the next mindful step.": {
    interpretation: "A teaching becomes usable at the point where a choice is available, rather than only in an imagined future life.",
    application: "Choose the next task already in front of you and identify one way to do it with less harm: speak accurately, return something borrowed, or finish a promised small action.",
    question: "Which available choice would put your understanding into practice?"
  },
  "You do not need to carry every thought that visits you.": {
    interpretation: "A thought appearing does not automatically make it a responsibility, a fact, or an instruction.",
    application: "When a worry returns, ask whether it contains an action you can take now. Note that action if useful; otherwise return to the activity you chose, without demanding that the thought disappear.",
    question: "Which thought needs a response, and which only needs to be noticed?"
  },
  "Compassion grows where judgment loosens its grip.": {
    interpretation: "Loosening a fixed verdict about a person can reveal suffering and circumstances while leaving responsibility for conduct intact.",
    application: "Replace one global label, such as 'selfish,' with a description of what happened and what support or boundary is needed. You can understand more and still say no.",
    question: "What becomes visible when you describe the action without defining the whole person?"
  },
  "Silence is not empty when the heart is listening.": {
    interpretation: "Listening silence is active attention; it differs from withdrawing, withholding an answer, or waiting for a turn to speak.",
    application: "During a conversation, allow the other person to finish and check what you heard before offering advice. A simple 'Have I understood you?' can make the silence useful.",
    question: "What did you hear when you stopped rehearsing your reply?"
  },
  "Begin again gently; the breath is always willing.": {
    interpretation: "The breath is a poetic reminder that returning does not require a speech of self-blame or a perfect restart.",
    application: "After losing your place in practice, notice the next comfortable breath or an external sound and continue from there. Choose a different anchor if attending to breathing is unpleasant.",
    question: "What would a quiet restart look like right now?"
  },
  "Wisdom is the art of meeting life without adding unnecessary suffering.": {
    interpretation: "The emphasis is on avoidable additions, such as blame or retaliation, rather than a claim that all suffering can be chosen away.",
    application: "Separate a present difficulty from the extra verdict you are adding to it. Address the practical problem, and see whether one insult toward yourself or someone else can be left unsaid.",
    question: "Which part of this difficulty needs care, and which part are you adding?"
  },
  "Return to the breath before you return to the argument.": {
    interpretation: "A pause can create room to choose words; it does not decide who is right or make a necessary disagreement disappear.",
    application: "If the conversation is safe to pause, say that you need a moment and agree when to return. Notice a natural breath, then identify the one issue you actually want to discuss.",
    question: "What needs to be said once winning is no longer the immediate goal?"
  },
  "Peace grows when attention stops running ahead of the moment.": {
    interpretation: "Planning becomes burdensome when an imagined future repeatedly takes the place of the task or person actually present.",
    application: "While doing one task, keep a note nearby for future concerns rather than pursuing each one immediately. Return to the next visible part of the work; make time for planning afterward.",
    question: "Are you preparing for what comes next, or living through it repeatedly in advance?"
  },
  "Notice what is here before deciding what it means.": {
    interpretation: "Observation and interpretation can arrive almost together, yet they are different: an unanswered message is a fact; rejection may be a guess.",
    application: "Write one sentence describing only what you observed, followed by a second sentence naming what you inferred. Check whether more information is needed before acting.",
    question: "Which part do you know, and which part have you supplied?"
  },
  "One mindful pause can change the direction of an entire day.": {
    interpretation: "A small interruption may alter the next choice and its consequences; the quote offers possibility rather than a guarantee about the whole day.",
    application: "Catch one transition before a habit takes over, such as opening a feed or replying sharply. Decide deliberately whether to continue, postpone, or choose another action.",
    question: "Where is there still a choice before the familiar sequence begins?"
  },
  "The present moment asks for your attention, not your perfection.": {
    interpretation: "You can attend to experience while tired, distracted, or unhappy; awareness need not wait for an ideal inner state.",
    application: "During a simple chore, notice one sensation and then complete the next part of the task. If attention wanders, return without grading the quality of the moment.",
    question: "What could you notice if you stopped checking whether you were doing awareness perfectly?"
  },
  "Awareness begins when hurry loosens its hold.": {
    interpretation: "Hurry can narrow what you notice, even when speed is unnecessary; slowing one small action can expose the habit.",
    application: "Put down your cup before opening the next tab, or finish reading a sentence before replying. Keep necessary urgency where it belongs rather than carrying it into every movement.",
    question: "Which part of your current hurry is required by the situation?"
  },
  "Listen to the moment before filling it with your plans.": {
    interpretation: "Plans serve better when they respond to present conditions, including information that does not fit what you expected.",
    application: "At the start of a meeting, ask what has changed before proposing the agenda. Let one new fact alter your approach when it deserves to.",
    question: "What is happening now that your existing plan has not allowed for?"
  },
  "A wandering mind is not a failed mind; it is a mind ready to return.": {
    interpretation: "Noticing distraction is already a useful moment of recognition, rather than proof that the whole practice has failed.",
    application: "When you realize you have lost the thread of reading, sitting, or listening, locate the last point you remember and resume. There is no need to restart the entire session as punishment.",
    question: "Can noticing the drift count as progress in recognizing it?"
  },
  "Give one ordinary task the dignity of your full attention.": {
    interpretation: "An unremarkable task can deserve care without being turned into a spiritual achievement.",
    application: "Wash one cup without also reading a screen: notice the water, clean the rim, and put it away. Choose a task you can attend to safely, without neglecting other responsibilities.",
    question: "What changes when this task is allowed to be the task?"
  },
  "The more clearly you notice life, the less carelessly you move through it.": {
    interpretation: "Attention has an ethical use when it reveals the effects of actions on people and surroundings.",
    application: "Before leaving a shared space, notice who will use it next and what your departure leaves for them. Make one small repair, such as clearing a surface or communicating an unfinished task.",
    question: "What consequence becomes visible when you look beyond finishing your own part?"
  },
  "Kindness does not need an audience to become meaningful.": {
    interpretation: "Recognition can be pleasant without being the measure of whether an action helped.",
    application: "Do one useful thing that does not need a public account: replace a shared supply, return a misplaced item, or make a routine task easier for someone. Let its usefulness be enough.",
    question: "Would you still choose this action if nobody learned you had done it?"
  },
  "Before judging another life, remember how much of your own remains unseen.": {
    interpretation: "The gap between your outward behavior and private circumstances is a reason to be cautious about interpreting someone else's life from a fragment.",
    application: "When a brief encounter invites a sweeping conclusion, name one thing you do not know. Respond to the actual behavior while leaving room for missing context.",
    question: "What would be missed if someone judged your day from this single moment?"
  },
  "A gentle response can end suffering that anger would pass along.": {
    interpretation: "Gentleness can interrupt the transmission of irritation without requiring agreement or silence about a problem.",
    application: "After a frustrating exchange, avoid making the next uninvolved person carry it. State your immediate need clearly, and postpone a reply if you cannot yet speak without attacking.",
    question: "Who might receive an anger that did not begin with them?"
  },
  "Compassion asks what hurts before it asks who is to blame.": {
    interpretation: "Starting with suffering can reveal what needs care; establishing responsibility may still be necessary afterward.",
    application: "If someone makes an error, first check whether anyone is hurt or needs practical help. Then discuss what happened and how to prevent it, without making humiliation part of the correction.",
    question: "What needs attention before the argument about blame begins?"
  },
  "Offer others the patience you hope to receive on your difficult days.": {
    interpretation: "Remembering your own limited days can make another person's slowness or mistake less easy to reduce to a character flaw.",
    application: "Give a person who is struggling time to finish a sentence or understand an instruction. Be clear about real deadlines, rather than disguising pressure as patience.",
    question: "What reasonable allowance would you hope for in their position?"
  },
  "To understand someone is not to excuse harm; it is to see more clearly.": {
    interpretation: "Explanation answers how behavior arose; accountability asks what must stop, change, or be repaired.",
    application: "You can acknowledge someone's fear or history while naming unacceptable conduct and keeping distance. Understanding does not require contact, reconciliation, or putting yourself at risk.",
    question: "Which boundary remains necessary even when you understand the circumstances?"
  },
  "The heart becomes spacious each time it chooses care over contempt.": {
    interpretation: "Contempt compresses a person into something beneath consideration; care can reject their conduct without making that reduction.",
    application: "In a disagreement, remove one mocking label from what you plan to say. Describe the harm and the change you are asking for in language that leaves dignity intact.",
    question: "Can your objection remain clear after the insult is removed?"
  },
  "Small kindnesses often reach places that advice cannot.": {
    interpretation: "A person facing difficulty may need a manageable burden reduced more than another explanation of what they should do.",
    application: "Ask whether listening, a meal, a practical errand, or advice would help. Let the answer guide your offer instead of assuming that your preferred kind of help is wanted.",
    question: "What would make the next hour easier for this person?"
  },
  "Let your boundaries be clear and your heart remain kind.": {
    interpretation: "A boundary states what you will do or accept; kindness does not require weakening it until it becomes ineffective.",
    application: "Use a direct sentence such as 'I cannot take on that task' and offer an alternative only if it is realistic. You do not owe repeated explanations to someone who disregards your safety.",
    question: "Can you make the limit understandable without turning it into an attack?"
  },
  "When you cannot remove another's burden, do not add to its weight.": {
    interpretation: "Limited power to help does not make blame, pressure, or demands for reassurance harmless.",
    application: "When someone shares a difficulty you cannot fix, acknowledge it without telling them how quickly they should recover. Offer one specific form of help you can actually provide, or listen if that is what they want.",
    question: "Is your response easing their burden or asking them to manage your discomfort too?"
  },
  "Patience is the strength to remain present while life takes its time.": {
    interpretation: "Remaining present means meeting a delay without abandoning the actions that are still useful.",
    application: "While waiting for a reply or result, identify when a follow-up would be reasonable and what can be done meanwhile. Patience need not mean waiting indefinitely when action or protection is needed.",
    question: "What belongs to useful effort, and what belongs to waiting?"
  },
  "Not every delay is an obstacle; some are invitations to soften.": {
    interpretation: "An inconvenient pause may reveal tension that speed had concealed, without making all delays beneficial.",
    application: "During a harmless queue, release an unnecessary grip on your bag or phone and notice the surroundings. If the delay has real consequences, communicate them and seek a practical alternative.",
    question: "Can you respond to this delay without making every part of it an enemy?"
  },
  "Wait long enough for the first reaction to become a wiser response.": {
    interpretation: "A first reaction supplies information, but it need not be the final wording or decision.",
    application: "Save a charged message as a draft and reread it after a short break. Keep the necessary facts and request, and remove any sentence whose main purpose is to wound.",
    question: "What would you keep in this reply after the impulse to punish passed?"
  },
  "Growth is quiet work, often invisible until the season changes.": {
    interpretation: "Some changes become visible through repeated situations rather than a dramatic feeling of progress.",
    application: "Compare how you handled one recurring difficulty this month with how you handled it earlier. Look for an observable difference, such as a shorter argument or a repair made sooner, without inventing improvement.",
    question: "What small change can you point to in your actions?"
  },
  "Be patient with the part of you that is still learning what peace feels like.": {
    interpretation: "Unfamiliar calm can be difficult to approach; needing time or support is not a moral failure.",
    application: "Choose a brief, comfortable pause with your eyes open rather than forcing a long inward practice. If stillness increases distress, stop and seek an approach or qualified support that fits your circumstances.",
    question: "What pace allows care rather than pressure?"
  },
  "A difficult moment becomes heavier when we demand that it end immediately.": {
    interpretation: "Urgently arguing with discomfort can add strain, although some difficulties require prompt practical action.",
    application: "For an unavoidable inconvenience, separate 'this is unpleasant' from 'this must already be over.' Then choose one helpful action; do not use acceptance to remain in danger or neglect a medical need.",
    question: "What is the difficulty itself, and what is the demand you are adding?"
  },
  "Patience makes room for truth to arrive without force.": {
    interpretation: "Pressing for certainty before facts are available can produce a quick answer that deserves little confidence.",
    application: "When an account is incomplete, ask a precise question and allow time to check it. Set a reasonable decision point rather than filling the gap with an accusation or pretending certainty.",
    question: "What information would you need before reaching a fair conclusion?"
  },
  "The path unfolds at the pace of sincere practice, not restless comparison.": {
    interpretation: "Someone else's visible confidence or practice schedule is a poor measure of what your circumstances require.",
    application: "Choose one practice you can sustain and review its effects on conduct, such as listening or keeping a commitment. Adjust it to your capacities instead of copying another person's intensity.",
    question: "What would you practice if nobody else's progress were available for comparison?"
  },
  "Some answers become clear only after the mind stops chasing them.": {
    interpretation: "A pause may reveal assumptions that repeated mental searching has stopped examining; it does not make evidence unnecessary.",
    application: "Write down an unresolved question, the facts you have, and the next fact you need. Take a break before returning to it, and distinguish fresh information from another round of the same speculation.",
    question: "Has the last round of thinking added anything new?"
  },
  "Stay gentle with beginnings; they are carrying more than they can show.": {
    interpretation: "Early attempts include effort and uncertainty that a finished result does not reveal.",
    application: "When learning a skill, define one manageable first attempt and one specific piece of feedback. Offer a beginner useful guidance instead of expecting the fluency of someone who has practiced for years.",
    question: "What would make this beginning easier to continue?"
  },
  "Letting go begins by admitting how tightly you are holding.": {
    interpretation: "You cannot choose a different relationship to an outcome while denying the demands you have placed on it.",
    application: "Complete the sentence 'I need this to happen exactly this way because…' and look at the fear or expectation that follows. Decide which part calls for practical action and which cannot be guaranteed.",
    question: "What are you asking this outcome to secure for you?"
  },
  "Release the need to replay what can no longer be changed.": {
    interpretation: "Review is useful when it leads to learning or repair; replay becomes different when it repeatedly reaches the same closed end.",
    application: "Write down one lesson and any repair still available, then return to a present activity. If memories are intrusive or distressing, difficulty stopping them is not a failure of will, and qualified support may help.",
    question: "Is this review producing a next step, or only another repetition?"
  },
  "You can honor the past without asking it to become your home.": {
    interpretation: "Remembering can remain part of life without requiring present choices to reproduce an earlier time.",
    application: "Keep one meaningful object, story, or remembrance while making room for a current need or relationship. There is no deadline for grief and no obligation to discard what still matters.",
    question: "How could remembrance and present-day care both have a place?"
  },
  "An open hand can care for what a clenched fist cannot.": {
    interpretation: "The open hand is a metaphor for support that leaves room for another person's agency, rather than care organized around control.",
    application: "When helping someone, ask what they want before arranging the solution. Offer what you can responsibly give, and allow an answer that differs from your preference.",
    question: "Where might your wish to help have become a demand to decide?"
  },
  "Peace enters when control is no longer the price of feeling safe.": {
    interpretation: "Trying to control every uncertain detail can become exhausting; the line does not mean that real safety measures should be abandoned.",
    application: "In a situation that is already safe, identify one harmless detail you can leave to someone else. Keep necessary protections and seek support where the danger is real.",
    question: "Which protection is necessary, and which repeated check no longer adds safety?"
  },
  "Release the outcome, but keep the care you bring to the work.": {
    interpretation: "You can be accountable for preparation and effort without possessing every condition that determines the result.",
    application: "Before handing over a piece of work, check what was within your responsibility and name any limitation honestly. Afterward, use feedback when it arrives rather than repeatedly checking for reassurance.",
    question: "What standard of care can you uphold without demanding a guaranteed result?"
  },
  "What leaves your life may still leave wisdom behind.": {
    interpretation: "An ending can contain a lesson, but loss does not owe you growth or need to be called beneficial.",
    application: "If it feels appropriate, name one thing an ended experience taught you about care, limits, or priorities. You can leave the question open when grief or uncertainty needs room.",
    question: "Is there something worth carrying forward without carrying the whole experience?"
  },
  "You do not betray a memory by allowing yourself to move forward.": {
    interpretation: "New commitments and moments of enjoyment do not erase the significance of someone or something you have lost.",
    application: "Consider one small present-day activity you have avoided because it feels disloyal to a memory. Give yourself permission to choose it or postpone it, without turning either choice into a test of love.",
    question: "Could caring for your life now coexist with honoring what mattered?"
  },
  "Let the feeling pass through without building it a permanent room.": {
    interpretation: "A passing feeling need not become a permanent description of who you are; passing is not something you must force.",
    application: "Try 'sadness is here' rather than 'I am nothing but sadness,' then attend to a simple supportive activity. Persistent distress deserves care and may need professional support, even when it does not quickly change.",
    question: "Can you acknowledge this feeling without making it your whole identity?"
  },
  "Freedom often sounds like the quiet end of an inner argument.": {
    interpretation: "Some internal debates continue after the available facts and choices have been exhausted.",
    application: "Ask whether the argument concerns a decision you can still make. If it does, choose a next step; if it does not, let your attention return to something present without requiring a final winning speech.",
    question: "What would remain to do if you no longer had to win this argument in your mind?"
  },
  "Meditation is not leaving life; it is learning how to be here.": {
    interpretation: "Practice can include ordinary experience, rather than demanding an escape from thought, sound, or responsibility.",
    application: "During a brief sit, notice a nearby sound and the support of the chair before attending to breathing. End by returning to one ordinary task with care, instead of judging the session by how far away life felt.",
    question: "Did practice help you meet the next part of life more attentively?"
  },
  "Sit without demanding silence, and the mind will teach you how it moves.": {
    interpretation: "A quiet setting may help, but thoughts and sounds need not be treated as evidence that a session is invalid.",
    application: "Notice whether attention is planning, remembering, or listening, then return to a comfortable anchor. You can shorten or stop the practice if observing inwardly becomes distressing.",
    question: "What pattern did you notice when you stopped requiring a blank mind?"
  },
  "The cushion is a place to practice returning, not a place to perform calm.": {
    interpretation: "The outward appearance of stillness says little about the care involved in recognizing distraction and returning.",
    application: "For a short practice, notice each return without counting it as a correction of a personal defect. Use a chair or another comfortable position; a particular posture is not the point of this reflection.",
    question: "Are you practicing attention or trying to look like an imagined meditator?"
  },
  "Follow the breath lightly, as you would listen to rain.": {
    interpretation: "Listening to rain suggests receptivity: there is something to notice without needing to manufacture it.",
    application: "Allow breathing to remain natural and notice one place where its movement is comfortable to sense. If you find yourself controlling it or becoming uneasy, shift to an external sound or stop.",
    question: "Can the breath be noticed without being made to perform?"
  },
  "A short sincere practice can steady a long and complicated day.": {
    interpretation: "A brief pause may support the next decision, though it cannot guarantee calm or remove the day's demands.",
    application: "Before a demanding task, take a minute to settle comfortably and identify your immediate intention. Choose one thing you will attend to, rather than expecting the pause to fix everything ahead.",
    question: "What modest support would make the next task more workable?"
  },
  "When stillness feels impossible, begin by noticing the restlessness.": {
    interpretation: "Restlessness can be part of what you recognize instead of an obstacle you must defeat before beginning.",
    application: "Name the wish to move and check whether a short walk or a change of posture is needed. There is no requirement to hold still through pain, panic, or increasing distress.",
    question: "What is the restlessness asking for, and what response would be kind and practical?"
  },
  "Every return from distraction strengthens the path home.": {
    interpretation: "Home is a metaphor for renewed contact with a chosen activity, not a destination at which distraction disappears forever.",
    application: "When you notice that you have drifted from a conversation, return to the speaker and ask for clarification if needed. The useful movement is re-engagement, rather than hiding that attention wandered.",
    question: "Where could a straightforward return replace embarrassment about having drifted?"
  },
  "Do not search meditation for a special self; notice the self already searching.": {
    interpretation: "The line questions the wish to become an impressive meditator; it is an editorial reflection, not a complete explanation of Buddhist not-self.",
    application: "If you catch yourself imagining how advanced practice should make you, notice that ambition as another thought and return to the chosen anchor. Leave questions of doctrine to careful study rather than forcing an identity conclusion.",
    question: "What are you hoping the practice will prove about you?"
  },
  "Sit with the day as it is, before asking it to be different.": {
    interpretation: "Recognizing current conditions can precede changing them; recognition is not approval of avoidable harm.",
    application: "At a pause, name one fact about the day and one feeling about it separately. Then choose whether the useful response is rest, a conversation, practical action, or simply continuing.",
    question: "What can you acknowledge before deciding what needs to change?"
  },
  "The bell fades, but careful listening can continue.": {
    interpretation: "The end of a formal cue need not mark the end of attention; the next sound or activity can become the place to continue.",
    application: "When a timer ends, listen until its sound has faded and notice what you hear next. Carry that quality of listening into the first words spoken after practice.",
    question: "What happens to your attention immediately after the cue ends?"
  },
  "Wisdom sees the whole fire, not only the spark that caused it.": {
    interpretation: "The spark is the immediate trigger; the wider fire includes conditions that allowed the difficulty to grow.",
    application: "After a recurring argument, look beyond the last sentence to fatigue, unclear expectations, and unresolved tasks. Address a contributing condition without erasing responsibility for hurtful words.",
    question: "What kept this problem ready to ignite?"
  },
  "A clear mind can hold two truths without rushing to make one disappear.": {
    interpretation: "Two relevant facts can coexist, such as caring for someone and being unable to meet their request; this does not make every contradictory claim true.",
    application: "Write both facts in a difficult choice without joining them with 'but.' Decide what action respects each one as far as the circumstances allow.",
    question: "Which fact have you been trying to erase to make the choice feel simpler?"
  },
  "Knowing when not to speak is also a form of honest speech.": {
    interpretation: "Holding back an unverified claim or a punishing remark can protect truth; silence is less helpful when it conceals necessary information.",
    application: "Before passing on a story, check whether you know it is true and whether you are the right person to share it. Speak when safety, accountability, or a needed correction requires it.",
    question: "Would silence protect care and accuracy here, or avoid a truth that needs saying?"
  },
  "The lesson repeats until attention replaces habit.": {
    interpretation: "The line describes a recurring pattern to examine, rather than a claim that hardship is deliberately sent to teach you.",
    application: "Choose one repeated frustration and trace what you usually do immediately before it. Change one observable part of that sequence and see what happens, instead of blaming yourself for having the same problem again.",
    question: "At what point in the familiar sequence is another action possible?"
  },
  "What feels urgent is not always what matters most.": {
    interpretation: "A demand for immediate attention can come from noise or anxiety as well as genuine importance.",
    application: "Before switching tasks, ask what would happen if the interruption waited ten minutes and what would happen if your current commitment kept being postponed. Treat real safety needs as urgent.",
    question: "Which task matters because of its consequences, rather than its volume?"
  },
  "Wisdom is less interested in winning than in ending needless harm.": {
    interpretation: "Winning an exchange can still leave the underlying problem worse; reducing harm asks a different question about success.",
    application: "In a disagreement, define the practical outcome you need before choosing your next words. A correction, boundary, or workable agreement may serve that outcome better than a final cutting remark.",
    question: "What would improve this situation even if nobody declared you the winner?"
  },
  "See the conditions behind an action, and blame may soften into understanding.": {
    interpretation: "Conditions help explain behavior and reveal possibilities for change; they do not cancel agency or accountability.",
    application: "When a task repeatedly goes wrong, check the instructions, resources, time, and expectations before assuming indifference. Correct the process and still address any deliberate or harmful conduct.",
    question: "Which condition could change the likelihood of this happening again?"
  },
  "A useful truth is carried with humility, not used as a weapon.": {
    interpretation: "Accuracy alone does not settle whether the way you deliver information is fair, timely, or needlessly humiliating.",
    application: "Give a necessary correction privately when possible, state what you know, and acknowledge what you may have missed. Aim to help someone understand or act, rather than display their error.",
    question: "What purpose will this truth serve in the way you plan to tell it?"
  },
  "Learn from discomfort without turning suffering into an identity.": {
    interpretation: "Pain can deserve attention without becoming a permanent definition of your worth or future.",
    application: "Describe one difficulty specifically, such as 'this task is overwhelming today,' and identify support or an adjustment. You do not need to extract a lesson from every painful experience or manage persistent distress alone.",
    question: "What description leaves room for both the difficulty and the rest of your life?"
  },
  "The wise heart changes course when clearer seeing arrives.": {
    interpretation: "Consistency is not the same as wisdom when new evidence shows that a decision is causing harm or no longer fits.",
    application: "If you change your mind, explain what you learned and what you will do differently. Repair consequences of the earlier choice rather than treating the change as a reason to hide it.",
    question: "What evidence would justify changing your current course?"
  },
  "Everything changes, including the part of you that fears change.": {
    interpretation: "Fear itself can vary with circumstances, support, and time; the quote does not promise that it will quickly disappear.",
    application: "Notice whether your response to one change differs at different times of day or with someone supportive nearby. Use that observation to plan care, rather than assuming your present fear is the only possible response.",
    question: "Under what conditions does this fear become a little more workable?"
  },
  "The fading flower does not make its blooming less beautiful.": {
    interpretation: "An experience ending does not erase the value it had while it was present.",
    application: "Recall one ordinary pleasure that has finished, such as a visit or a shared meal, and name what mattered about it. Appreciation can coexist with sadness that it is over.",
    question: "Can something have been worthwhile without having lasted?"
  },
  "Because this moment will pass, meet it while it is here.": {
    interpretation: "Remembering that a moment is temporary can invite attention rather than a desperate attempt to preserve it.",
    application: "During a welcome conversation or meal, put aside one unnecessary distraction and notice the person or experience in front of you. There is no need to manufacture a special memory or prevent the ending.",
    question: "What would fuller participation look like without trying to hold the moment still?"
  },
  "Change takes nothing personally; it simply continues.": {
    interpretation: "The line personifies change to question the feeling that every disruption is directed against you.",
    application: "When weather, aging equipment, or a changed schedule interferes with a plan, identify the actual cause and adjust what you can. This perspective does not excuse a person's deliberate harmful choice.",
    question: "What response becomes possible when the disruption is not treated as a personal verdict?"
  },
  "Today's certainty may become tomorrow's lesson in humility.": {
    interpretation: "Confidence can be reasonable while still remaining open to correction by better information.",
    application: "When making a strong claim, name the evidence behind it and one condition that could change your view. If you discover an error, correct the claim where others may have relied on it.",
    question: "What would you need to learn to revise what now feels certain?"
  },
  "The passing of joy teaches gratitude; the passing of pain teaches hope.": {
    interpretation: "This is an invitation to perspective, not a promise that pain ends on a schedule or that every loss feels instructive.",
    application: "Appreciate a pleasant experience without demanding that it last, and seek support during difficulty without having to feel hopeful first. Both responses can make room for changing conditions.",
    question: "What care is possible while you do not yet know how this experience will change?"
  },
  "No season is asked to remain in order to be loved.": {
    interpretation: "The seasonal image suggests appreciation without making permanence a condition of value.",
    application: "Notice something particular about the current season or stage of a familiar place. Let the observation be specific, without comparing it only to the time you wish would return.",
    question: "What is available to appreciate in this stage of things?"
  },
  "Hold each day carefully, knowing it cannot be held forever.": {
    interpretation: "Careful holding means how you spend attention and treat people, rather than preserving a day unchanged.",
    application: "Choose one ordinary exchange you do not want to rush through by default. Offer the attention, thanks, or necessary apology now instead of assuming there will always be another chance.",
    question: "What small act of care belongs to today?"
  },
  "What changes is not always lost; sometimes it is being transformed.": {
    interpretation: "Change can alter the form of something valued without erasing every part of it, although some losses are real and irreversible.",
    application: "When a role or routine changes, distinguish what has ended from what can continue in another form. Preserve a useful value or connection where possible, without requiring a positive story about the loss.",
    question: "What has ended, and what could be carried differently?"
  },
  "Acceptance begins where the argument with change ends.": {
    interpretation: "Acceptance recognizes the conditions now present so that action can respond to them; it is not approval of everything that happened.",
    application: "State one changed fact without adding 'this should not have happened.' Then decide what can be repaired, protected, adapted, or grieved in light of that fact.",
    question: "Which next step becomes visible when the changed condition is acknowledged?"
  },
  "Walk slowly enough to notice where your life is actually happening.": {
    interpretation: "Walking can reveal the difference between moving through a place and mentally skipping over it.",
    application: "On a safe stretch, notice a few steps and one detail of your surroundings without using a screen. Keep your normal safe pace near roads or crowds, and adapt the reflection to another kind of movement if needed.",
    question: "What did you notice on a route you usually pass through without seeing?"
  },
  "Practice becomes real when it enters your speech and choices.": {
    interpretation: "Knowing the language of a teaching is different from letting it affect conduct when a choice is inconvenient.",
    application: "Choose one conversation in which you can check a fact, avoid gossip, or make an honest request. Use the actual effect on the exchange as the point of reflection afterward.",
    question: "Which choice today would show the value you say matters?"
  },
  "The smallest wholesome action is larger than the finest untested intention.": {
    interpretation: "An intention gains practical meaning when it becomes an action that reduces harm or supports care.",
    application: "Turn one broad wish into a small commitment you can complete today, such as returning a call or correcting an error. Keep it realistic rather than announcing a larger promise you cannot keep.",
    question: "What is the smallest action that would give this intention a visible form?"
  },
  "Do not wait to feel ready before choosing what is kind.": {
    interpretation: "A helpful action can be available before confidence arrives, provided it respects your capacity and the other person's needs.",
    application: "Send the simple message of thanks or make the modest offer you have been postponing. Ask before intervening where help may be unwanted, and do not mistake overextending yourself for kindness.",
    question: "Which useful gesture needs little more than a clear and willing choice?"
  },
  "Your next response is always part of the path.": {
    interpretation: "Even after a mistake, the response now available can express care, accountability, or restraint.",
    application: "If you have spoken harshly, name the words and their effect without attaching an excuse. Ask what repair is possible and make the next exchange more careful.",
    question: "What kind of response is still available from where you actually are?"
  },
  "A peaceful life is built from peaceful moments practiced repeatedly.": {
    interpretation: "The line directs attention toward repeatable conduct, without claiming that personal practice controls every hardship in life.",
    application: "Choose one recurring point of friction, perhaps a household handover or an evening message, and agree on a clearer, less adversarial way to handle it. Notice whether repetition helps the interaction.",
    question: "Which recurring exchange could become less harmful through one reliable change?"
  },
  "Bring the teaching into the place where you are most easily irritated.": {
    interpretation: "A familiar irritation offers a concrete place to test understanding, rather than keeping practice separate from difficult relationships and tasks.",
    application: "Before the next predictable frustration, identify one response you want to avoid and one clear request you can make instead. Leave unsafe situations; this reflection is not a test of endurance.",
    question: "Where does your understanding most often disappear when you need it?"
  },
  "Daily practice turns understanding from an idea into a way of living.": {
    interpretation: "Repeated application can reveal what an idea means in circumstances that reading alone does not supply.",
    application: "Choose one value, such as truthful speech, and connect it to a daily cue like sending your first message. Review one actual example in the evening and adjust the next attempt.",
    question: "What did practicing this idea reveal that merely agreeing with it did not?"
  },
  "Begin with what is possible, then return tomorrow.": {
    interpretation: "A beginning matched to present capacity is easier to revisit than a plan built around an ideal day.",
    application: "Set a modest action and a clear cue for repeating it, such as reading one paragraph after breakfast. If tomorrow is interrupted, resume when possible instead of treating the missed day as cancellation.",
    question: "What beginning is small enough to fit the life you have?"
  },
  "The path is shaped by what you repeat when no one is watching.": {
    interpretation: "Private habits can matter as much as publicly stated values because they become familiar ways of responding.",
    application: "Notice one unobserved choice, such as how you speak about someone absent or handle a small error. Act according to the same standard you would want to defend openly.",
    question: "Which private repetition is helping to shape the person others encounter?"
  },
  "Anger asks for speed; awareness asks for one more breath.": {
    interpretation: "Anger's urgency can make immediate expression feel necessary, while a brief pause may allow a safer choice.",
    application: "Before acting on a non-emergency irritation, stop typing or speaking for a moment and notice a natural breath or nearby sound. Then name the issue directly; do not postpone action needed for safety.",
    question: "What would change if this response did not have to be immediate?"
  },
  "Name the feeling gently, and it may stop speaking for your whole life.": {
    interpretation: "Naming a feeling can distinguish a current experience from a sweeping conclusion about your whole life; it will not necessarily make the feeling weaker.",
    application: "Try a specific description such as 'I feel disappointed about this result' instead of 'nothing ever works.' Include the need or support that follows from the actual situation.",
    question: "What is the feeling saying about this moment, before it becomes a verdict about everything?"
  },
  "The body often knows you are overwhelmed before the mind admits it.": {
    interpretation: "The body 'knowing' is a metaphor for noticing signals such as tension or fatigue before you have named your limits; those sensations can have other causes too.",
    application: "When a familiar signal appears, check whether you need food, a break, help, or a change in workload. New, severe, or concerning symptoms deserve appropriate medical attention rather than an assumed emotional explanation.",
    question: "What practical need might you be overlooking while insisting that you are fine?"
  },
  "Awareness does not remove the storm; it keeps you from becoming every cloud.": {
    interpretation: "The weather image distinguishes a changing experience from a complete identity, without promising protection from difficult feelings.",
    application: "When your mood shifts, describe what is here and continue one supportive activity if possible. You can take a feeling seriously without treating every thought it brings as the final account of your life.",
    question: "What remains part of your life beyond the mood present now?"
  },
  "Look beneath the reaction and you may find a need asking to be understood.": {
    interpretation: "A reaction can point toward a concern, such as rest, fairness, or safety, though the first explanation you invent may be mistaken.",
    application: "After snapping at someone, ask what you needed and whether you communicated it. Make a specific request or repair rather than treating the need as an excuse for the outburst.",
    question: "What need could you express more clearly than the reaction expressed it?"
  },
  "What you can observe clearly no longer controls you in quite the same way.": {
    interpretation: "Recognizing a habit can reveal a point of choice; insight alone does not guarantee that a strong pattern will stop.",
    application: "Notice the cue before a familiar action, such as reaching for the phone when a task becomes difficult. Try one small alternative and seek practical support for patterns that remain harmful or difficult to change.",
    question: "Where in this pattern have you noticed an opening for a different action?"
  },
  "Feelings are honest about their presence, not always about their conclusions.": {
    interpretation: "A feeling is real as an experience even when the story attached to it needs checking.",
    application: "If you feel excluded, acknowledge the hurt and then check what you know about the situation before assuming intent. Ask a clear question where appropriate, without dismissing your feeling or treating it as proof.",
    question: "What evidence supports the conclusion this feeling is suggesting?"
  },
  "Notice the habit before trying to become someone without it.": {
    interpretation: "A wish for a different identity can obscure the specific sequence that makes a habit repeat.",
    application: "Describe one occurrence in concrete terms: the cue, the action, and what followed. Choose a change at one point in that sequence instead of making a broad promise to become a new person.",
    question: "What actually happened just before the habit began?"
  },
  "When the mind tightens, let the body be your first teacher.": {
    interpretation: "Physical contact or movement can sometimes offer a simpler point of attention than continuing an argument in thought.",
    application: "If comfortable, feel the chair supporting you, relax your grip, or take a short walk. Use an external object or sound instead if attention to bodily sensations increases distress.",
    question: "Which comfortable point of contact helps you notice where you are?"
  },
  "Clear seeing begins with the courage to stop looking away.": {
    interpretation: "Avoiding an uncomfortable fact may postpone the very information needed for care or repair.",
    application: "Choose one manageable fact you have been avoiding, such as an unanswered commitment, and look at it with any support you need. Take one proportionate step; you do not need to face every difficulty at once.",
    question: "What could you acknowledge today without overwhelming yourself?"
  },
  "Begin again without turning yesterday into a sentence.": {
    interpretation: "Yesterday can be evidence to learn from without becoming a permanent judgment that prevents a different action.",
    application: "Name what went wrong and any repair still owed, then make one achievable choice today. Beginning again includes accountability rather than pretending the earlier action did not matter.",
    question: "What does yesterday ask you to repair, and what does it not have to decide?"
  },
  "A new direction can start with one different choice.": {
    interpretation: "A change of direction first becomes visible in a specific action, even when the larger result remains uncertain.",
    application: "At one familiar decision point, choose a realistic alternative: ask for clarification, stop an unnecessary purchase, or keep a small promise. Review the outcome before making a larger commitment.",
    question: "Which repeated choice could you alter once today?"
  },
  "The path welcomes your return more often than pride allows.": {
    interpretation: "Pride may make resuming seem embarrassing after a confident promise or a long absence.",
    application: "Reopen the book, attend the session, or make the honest apology without waiting for an impressive explanation. Ask about current expectations if returning involves a group or another person's trust.",
    question: "What are you postponing because you think returning must look impressive?"
  },
  "You are allowed to learn slowly and still be changing.": {
    interpretation: "A slow pace does not by itself show that learning is absent; useful progress can be uneven and specific.",
    application: "Identify one thing you understand or do more clearly than before and one thing that still needs help. Adjust the pace or method where needed, rather than requiring speed as proof of worth.",
    question: "What can you now recognize that you used to miss?"
  },
  "Morning is not the only time a life can begin again.": {
    interpretation: "Missing an intended start does not remove every later opportunity to act differently that day.",
    application: "If a morning plan has fallen apart, choose one small action for the next available break. Do not spend the rest of the day waiting for tomorrow's ideal beginning.",
    question: "What useful beginning fits the time that remains today?"
  },
  "Repair what you can, forgive what you cannot redo, and continue with care.": {
    interpretation: "Repair concerns what remains possible; accepting irreversibility need not erase responsibility or require forgiveness before you are ready.",
    application: "Separate an apology, replacement, or changed behavior you can offer from a past event you cannot reverse. If another person was harmed, respect their boundaries and do not demand reconciliation as proof that repair is complete.",
    question: "What repair is still yours to make, even though the past cannot be redone?"
  },
  "A mistake becomes a teacher when honesty enters the room.": {
    interpretation: "A mistake provides useful information only when you can examine what actually happened without concealment or exaggeration.",
    application: "Describe your part, the consequence, and one change that would reduce a repeat. Correct the record with anyone affected instead of keeping the lesson entirely private.",
    question: "What would an accurate account of this mistake allow you to change?"
  },
  "Do not confuse an old pattern with an unchangeable nature.": {
    interpretation: "A long-standing habit is a pattern to understand, rather than sufficient evidence that every future response is fixed.",
    application: "Look for a circumstance in which the pattern is less strong and identify what differs there. Use that condition as a starting point, while seeking appropriate help where changing the behavior needs support.",
    question: "When does this pattern loosen, and what makes that possible?"
  },
  "Hope can be quiet and still keep walking.": {
    interpretation: "Hope need not arrive as confidence or enthusiasm; sometimes it is a modest willingness to keep receiving support and taking a next step.",
    application: "Choose one manageable action for today, such as eating, contacting someone supportive, or completing a small responsibility. You do not have to feel optimistic for that action to count as care.",
    question: "What next step is possible without asking yourself to feel hopeful first?"
  },
  "Each conscious breath is a small vote for beginning again.": {
    interpretation: "A noticed breath marks a return of attention rather than a verdict on the moments that came before it.",
    application: "Use a comfortable natural breath as a cue to resume one chosen task after interruption. An external sound or the sight of your workspace can serve as the cue if breath awareness is unhelpful.",
    question: "What would you like to return to after this pause?"
  }
};
