import os
import requests
import re

# It's best practice to use an environment variable for your token.
# Before running the script, set it in your terminal:
# export GITHUB_TOKEN='your_copied_token_here'
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')

if not GITHUB_TOKEN:
    raise ValueError("GitHub token not found. Please set the GITHUB_TOKEN environment variable.")

HEADERS = {
    'Authorization': f'token {GITHUB_TOKEN}',
    'Accept': 'application/vnd.github.v3+json',
}

# The list of 110 open-source URLs from your project
URLS = [
    'https://github.com/HumanSignal/Adala', 'https://github.com/LehengTHU/Agent4Rec',
    'https://github.com/DataBassGit/AgentForge', 'https://agentgpt.reworkd.ai/',
    'https://github.com/jbexta/AgentPilot', 'https://github.com/aiwaves-cn/agents',
    'https://github.com/OpenBMB/AgentVerse', 'https://github.com/eumemic/ai-legion',
    'https://github.com/paul-gauthier/aider', 'https://github.com/myshell-ai/AIlice',
    'https://github.com/microsoft/autogen', 'https://agpt.co/?utm_source=awesome-ai-agents',
    'https://github.com/emrgnt-cmplxty/automata', 'https://github.com/irgolic/AutoPR',
    'https://github.com/stepanogil/autonomous-hr-chatbot', 'https://github.com/yoheinakajima/babyagi',
    'https://yoheinakajima.com/babybeeagi-task-management-and-functionality-expansion-on-top-of-babyagi/', 'https://replit.com/@YoheiNakajima/BabyCatAGI',
    'https://twitter.com/yoheinakajima/status/1666313838868992001', 'https://twitter.com/yoheinakajima/status/1678443482866933760',
    'https://github.com/saten-private/BabyCommandAGI', 'https://github.com/yoheinakajima/babyagi/tree/main/classic/babyfoxagi',
    'https://github.com/pgalko/BambooAI', 'https://github.com/AutoPackAI/beebot',
    'https://github.com/seahyinghang8/blinky', 'https://bloop.ai/',
    'https://bondai.dev/', 'https://github.com/xeol-io/bumpgen',
    'https://cal.ai', 'https://github.com/camel-ai/camel',
    'https://www.chatarena.org/', 'https://github.com/OpenBMB/ChatDev',
    'https://github.com/ur-whitelab/chemcrow-public', 'https://github.com/ennucore/clippy/',
    'https://github.com/codefuse-ai/codefuse-chatbot', 'https://github.com/ajhous44/cody',
    'https://docs.sourcegraph.com/cody', 'https://continue.dev/',
    'https://github.com/joaomdmoura/crewai', 'https://github.com/Technion-Kishony-lab/data-to-paper',
    'https://www.databerry.ai/', 'https://github.com/melih-unsal/DemoGPT',
    'https://github.com/jina-ai/dev-gpt', 'https://github.com/stitionai/devika',
    'https://github.com/entropy-research/Devon', 'https://github.com/kuafuai/DevOpsGPT',
    'https://github.com/dot-agent/dotagent', 'https://eidolonai.com/',
    'https://github.com/uilicious/english-compiler', 'https://evo.ninja/',
    'https://fastagency.ai/latest/', 'https://flowiseai.com/',
    'https://github.com/amirrezasalimi/friday/', 'https://github.com/genia-dev/GeniA',
    'https://godmode.space/', 'https://github.com/Kav-K/GPTDiscord',
    'https://gptengineer.app/', 'https://github.com/0xpayne/gpt-migrate',
    'https://github.com/Pythagora-io/gpt-pilot', 'https://github.com/assafelovic/gpt-researcher',
    'https://github.com/nicepkg/gpt-runner', 'https://gptswarm.org/',
    'https://github.com/kreneskyp/ix', 'https://github.com/microsoft/JARVIS',
    'https://github.com/langroid/langroid', 'https://github.com/felixbrock/lemon-agent',
    'https://github.com/mpaepper/llm_agents', 'https://llmstack.ai/',
    'https://github.com/PromtEngineer/localGPT', 'https://github.com/farizrahman4u/loopgpt/tree/main',
    'https://github.com/samholt/l2mac', 'https://maige.app',
    'https://www.magickml.com/', 'https://github.com/memfreeme/memfree',
    'https://github.com/cpacker/MemGPT', 'https://github.com/biobootloader/mentat',
    'https://github.com/geekan/MetaGPT', 'https://github.com/muellerberndt/mini-agi',
    'https://github.com/composable-models/llm_multiagent_debate', 'https://github.com/rumpfmax/Multi-GPT',
    'https://github.com/codeintegrity-ai/mutahunter', 'https://github.com/mczhuge/NLSOM',
    'https://github.com/xlang-ai/OpenAgents', 'https://github.com/agiresearch/OpenAGI',
    'https://github.com/OpenDevin/OpenDevin', 'https://openinterpreter.com/',
    'https://www.pezzo.ai/', 'https://www.privategpt.io/',
    'https://github.com/topoteretes/PromethAI-Backend', 'https://reactagent.io/',
    'https://www.hyperwriteai.com/self-operating-computer', 'https://github.com/smol-ai/developer',
    'https://github.com/stackwiseai/stackwise', 'https://www.superagent.sh/',
    'https://superagi.com/', 'https://github.com/CR-Gjx/Suspicion-Agent',
    'https://github.com/princeton-nlp/SWE-agent', 'https://sweep.dev/',
    'https://github.com/TaxyAI/browser-extension', 'https://github.com/seanpixel/Teenage-AGI/blob/main/README.md#experiments',
    'https://github.com/microsoft/UFO', 'https://vanna.ai/',
    'https://voyager.minedojo.org/', 'https://w3gpt.ai/',
    'https://theolvs.github.io/westworld/', 'https://github.com/team-openpm/workgpt',
    'https://www.getwren.ai/', 'https://github.com/OpenBMB/XAgent',
    'https://github.com/yeagerai/yeagerai-agent', 'https://github.com/pj4533/yourgoal/?utm_source=awesome-ai-agents'
]

def get_repo_stats(url):
    """Parses a GitHub URL and fetches star and fork counts from the API."""
    
    # Regex to extract owner/repo from various GitHub URL formats
    match = re.search(r"github\.com/([^/]+)/([^/]+)", url)
    if not match:
        return None, None

    owner, repo = match.groups()
    repo = repo.replace('.git', '') # Clean up .git suffix if present

    api_url = f"https://api.github.com/repos/{owner}/{repo}"
    
    try:
        response = requests.get(api_url, headers=HEADERS)
        response.raise_for_status()  # Raises an exception for bad status codes (4xx or 5xx)
        
        data = response.json()
        stars = data.get('stargazers_count', 'N/A')
        forks = data.get('forks_count', 'N/A')
        
        return f"{owner}/{repo}", (stars, forks)
        
    except requests.exceptions.RequestException as e:
        return f"{owner}/{repo}", (f"Error: {e}", None)

def main():
    """Main function to iterate through URLs and print stats."""
    print("Fetching stats for open-source GitHub repositories...\n")
    
    for url in URLS:
        repo_name, stats = get_repo_stats(url)
        
        if repo_name and stats:
            stars, forks = stats
            print(f"Repo: {repo_name:<40} | Stars: ⭐ {stars:<6} | Forks: 🍴 {forks}")
        else:
            print(f"Skipping non-GitHub URL: {url}")
            
    print("\nDone.")

if __name__ == "__main__":
    main()