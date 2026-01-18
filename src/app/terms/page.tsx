import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { getNavCategories } from "@/lib/supabase/queries";
import { generateMetadata as generateSiteMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/constants";

export const metadata: Metadata = generateSiteMetadata({
  title: "Terms & Conditions",
  description:
    "Terms of Service, Acceptable Use Policy, Cookie Policy, and Project Work Terms & Conditions for Solve With Software Ltd.",
  path: "/terms",
});

export default async function TermsPage() {
  const navCategories = await getNavCategories();

  return (
    <>
      <Header categories={navCategories} />
      <main className="min-h-screen py-16 md:py-24">
        <Container className="max-w-4xl">
          <article className="prose prose-lg dark:prose-invert mx-auto">
            <h1>Terms & Conditions</h1>

            <nav className="not-prose mb-12 p-6 bg-muted/50 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Contents</h2>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#terms-of-service" className="text-primary hover:underline">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#cookie-policy" className="text-primary hover:underline">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#acceptable-use-policy" className="text-primary hover:underline">
                    Acceptable Use Policy
                  </a>
                </li>
                <li>
                  <a href="#disclaimer" className="text-primary hover:underline">
                    Disclaimer
                  </a>
                </li>
                <li>
                  <a href="#project-work-terms" className="text-primary hover:underline">
                    Project Work Terms & Conditions
                  </a>
                </li>
              </ul>
            </nav>

            {/* Terms of Service */}
            <section id="terms-of-service">
              <h2>Terms of Service</h2>
              <p>
                These Terms of Service govern your use of the website located at{" "}
                <a href="https://remasteryourmind.co.uk">https://remasteryourmind.co.uk</a> and
                any related services provided by Solve With Software Ltd.
              </p>
              <p>
                By accessing https://remasteryourmind.co.uk, you agree to abide by these Terms
                of Service and to comply with all applicable laws and regulations. If you do
                not agree with these Terms of Service, you are prohibited from using or
                accessing this website or using any other services provided by Solve With
                Software Ltd.
              </p>
              <p>
                We, Solve With Software Ltd, reserve the right to review and amend any of
                these Terms of Service at our sole discretion. Upon doing so, we will update
                this page. Any changes to these Terms of Service will take effect immediately
                from the date of publication.
              </p>
              <p className="text-muted-foreground">
                These Terms of Service were last updated on 5 January 2022.
              </p>

              <h3>Limitations of Use</h3>
              <p>
                By using this website, you warrant on behalf of yourself, your users, and
                other parties you represent that you will not:
              </p>
              <ul>
                <li>
                  modify, copy, prepare derivative works of, decompile, or reverse engineer
                  any materials and software contained on this website;
                </li>
                <li>
                  remove any copyright or other proprietary notations from any materials and
                  software on this website;
                </li>
                <li>
                  transfer the materials to another person or &quot;mirror&quot; the materials on any
                  other server;
                </li>
                <li>
                  knowingly or negligently use this website or any of its associated services
                  in a way that abuses or disrupts our networks or any other service Solve
                  With Software Ltd provides;
                </li>
                <li>
                  use this website or its associated services to transmit or publish any
                  harassing, indecent, obscene, fraudulent, or unlawful material;
                </li>
                <li>
                  use this website or its associated services in violation of any applicable
                  laws or regulations;
                </li>
                <li>
                  use this website in conjunction with sending unauthorised advertising or
                  spam;
                </li>
                <li>harvest, collect or gather user data without the user&apos;s consent; or</li>
                <li>
                  use this website or its associated services in such a way that may infringe
                  the privacy, intellectual property rights, or other rights of third parties.
                </li>
              </ul>

              <h3>Intellectual Property</h3>
              <p>
                The intellectual property in the materials contained in this website are owned
                by or licensed to Solve With Software Ltd and are protected by applicable
                copyright and trademark law. We grant our users permission to download one
                copy of the materials for personal, non-commercial transitory use.
              </p>
              <p>
                This constitutes the grant of a license, not a transfer of title. This license
                shall automatically terminate if you violate any of these restrictions or the
                Terms of Service, and may be terminated by Solve With Software Ltd at any
                time.
              </p>

              <h3>User-Generated Content</h3>
              <p>
                You retain your intellectual property ownership rights over content you submit
                to us for publication on our website. We will never claim ownership of your
                content but we do require a license from you in order to use it.
              </p>
              <p>
                When you use our website or its associated services to post, upload, share or
                otherwise transmit content covered by intellectual property rights, you grant
                to us a non-exclusive, royalty-free, transferable, sub-licensable, worldwide
                license to use, distribute, modify, run, copy, publicly display, translate or
                otherwise create derivative works of your content in a manner that is
                consistent with your privacy preferences and our Privacy Policy.
              </p>
              <p>
                The license you grant us can be terminated at any time by deleting your
                content or account. However, to the extent that we (or our partners) have used
                your content in connection with commercial or sponsored content, the license
                will continue until the relevant commercial or post has been discontinued by
                us.
              </p>
              <p>
                You give us permission to use your username and other identifying information
                associated with your account in a manner that is consistent with your privacy
                preferences and our Privacy Policy.
              </p>

              <h3>Liability</h3>
              <p>
                Our website and the materials on our website are provided on an &apos;as is&apos;
                basis. To the extent permitted by law, Solve With Software Ltd makes no
                warranties, expressed or implied, and hereby disclaims and negates all other
                warranties including, without limitation, implied warranties or conditions of
                merchantability, fitness for a particular purpose, or non-infringement of
                intellectual property, or other violation of rights.
              </p>
              <p>
                In no event shall Solve With Software Ltd or its suppliers be liable for any
                consequential loss suffered or incurred by you or any third party arising from
                the use or inability to use this website or the materials on this website,
                even if Solve With Software Ltd or an authorised representative has been
                notified, orally or in writing, of the possibility of such damage.
              </p>
              <p>
                In the context of this agreement, &quot;consequential loss&quot; includes any
                consequential loss, indirect loss, real or anticipated loss of profit, loss of
                benefit, loss of revenue, loss of business, loss of goodwill, loss of
                opportunity, loss of savings, loss of reputation, loss of use and/or loss or
                corruption of data, whether under statute, contract, equity, tort (including
                negligence), indemnity or otherwise.
              </p>
              <p>
                Because some jurisdictions do not allow limitations on implied warranties, or
                limitations of liability for consequential or incidental damages, these
                limitations may not apply to you.
              </p>

              <h3>Accuracy of Materials</h3>
              <p>
                The materials appearing on our website are not comprehensive and are for
                general information purposes only. Solve With Software Ltd does not warrant or
                make any representations concerning the accuracy, likely results, or
                reliability of the use of the materials on this website, or otherwise relating
                to such materials or on any resources linked to this website.
              </p>

              <h3>Links</h3>
              <p>
                Solve With Software Ltd has not reviewed all of the sites linked to its
                website and is not responsible for the contents of any such linked site. The
                inclusion of any link does not imply endorsement, approval or control by Solve
                With Software Ltd of the site. Use of any such linked site is at your own risk
                and we strongly advise you make your own investigations with respect to the
                suitability of those sites.
              </p>

              <h3>Right to Terminate</h3>
              <p>
                We may suspend or terminate your right to use our website and terminate these
                Terms of Service immediately upon written notice to you for any breach of
                these Terms of Service.
              </p>

              <h3>Severance</h3>
              <p>
                Any term of these Terms of Service which is wholly or partially void or
                unenforceable is severed to the extent that it is void or unenforceable. The
                validity of the remainder of these Terms of Service is not affected.
              </p>

              <h3>Governing Law</h3>
              <p>
                These Terms of Service are governed by and construed in accordance with the
                laws of UK. You irrevocably submit to the exclusive jurisdiction of the courts
                in that State or location.
              </p>
            </section>

            {/* Cookie Policy */}
            <section id="cookie-policy">
              <h2>Cookie Policy</h2>
              <p>
                We use cookies to help improve your experience of our website. For full
                details about the cookies we use, how we use them, and your choices regarding
                cookies, please see our dedicated{" "}
                <Link href="/cookie-policy">Cookie Policy</Link>.
              </p>
            </section>

            {/* Acceptable Use Policy */}
            <section id="acceptable-use-policy">
              <h2>Acceptable Use Policy</h2>
              <p>
                This acceptable use policy covers the products, services, and technologies
                (collectively referred to as the &quot;Products&quot;) provided by Solve With Software
                Ltd under any ongoing agreement. It&apos;s designed to protect us, our customers
                and the general Internet community from unethical, irresponsible and illegal
                activity.
              </p>
              <p>
                Solve With Software Ltd customers found engaging in activities prohibited by
                this acceptable use policy can be liable for service suspension and account
                termination. In extreme cases, we may be legally obliged to report such
                customers to the relevant authorities.
              </p>
              <p className="text-muted-foreground">
                This policy was last reviewed on 5 January 2022.
              </p>

              <h3>Fair use</h3>
              <p>
                We provide our facilities with the assumption your use will be &quot;business as
                usual&quot;, as per our offer schedule. If your use is considered to be excessive,
                then additional fees may be charged or capacity may be restricted.
              </p>
              <p>
                We are opposed to all forms of abuse, discrimination, rights infringement
                and/or any action that harms or disadvantages any group, individual or
                resource. We expect our customers and, where applicable, their users
                (&quot;end-users&quot;) to likewise engage our Products with similar intent.
              </p>

              <h3>Customer accountability</h3>
              <p>
                We regard our customers as being responsible for their own actions as well as
                for the actions of anyone using our Products with the customer&apos;s permission.
                This responsibility also applies to anyone using our Products on an
                unauthorised basis as a result of the customer&apos;s failure to put in place
                reasonable security measures.
              </p>
              <p>
                By accepting Products from us, our customers agree to ensure adherence to this
                policy on behalf of anyone using the Products as their end users. Complaints
                regarding the actions of customers or their end-users will be forwarded to the
                nominated contact for the account in question.
              </p>
              <p>
                If a customer — or their end-user or anyone using our Products as a result of
                the customer — violates our acceptable use policy, we reserve the right to
                terminate any Products associated with the offending account or the account
                itself or take any remedial or preventative action we deem appropriate without
                notice. To the extent permitted by law, no credit will be available for
                interruptions of service resulting from any violation of our acceptable use
                policy.
              </p>

              <h3>Prohibited activity</h3>

              <h4>Copyright infringement and access to unauthorised material</h4>
              <p>
                Our Products must not be used to transmit, distribute or store any material in
                violation of any applicable law. This includes but isn&apos;t limited to:
              </p>
              <ul>
                <li>
                  any material protected by copyright, trademark, trade secret or other
                  intellectual property right used without proper authorization, and
                </li>
                <li>
                  any material that is obscene, defamatory, constitutes an illegal threat or
                  violates export control laws.
                </li>
              </ul>
              <p>
                The customer is solely responsible for all material they input, upload,
                disseminate, transmit, create or publish through or on our Products, and for
                obtaining legal permission to use any works included in such material.
              </p>

              <h4>SPAM and unauthorised message activity</h4>
              <p>
                Our Products must not be used for the purpose of sending unsolicited bulk or
                commercial messages in violation of the laws and regulations applicable to
                your jurisdiction (&quot;spam&quot;). This includes but isn&apos;t limited to sending spam,
                soliciting customers from spam sent from other service providers, and
                collecting replies to spam sent from other service providers.
              </p>
              <p>
                Our Products must not be used for the purpose of running unconfirmed mailing
                lists or telephone number lists (&quot;messaging lists&quot;). This includes but isn&apos;t
                limited to subscribing email addresses or telephone numbers to any messaging
                list without the permission of the email address or telephone number owner,
                and storing any email addresses or telephone numbers subscribed in this way.
                All messaging lists run on or hosted by our Products must be &quot;confirmed
                opt-in&quot;. Verification of the address or telephone number owner&apos;s express
                permission must be available for the lifespan of the messaging list.
              </p>
              <p>
                We prohibit the use of email lists, telephone number lists or databases
                purchased from third parties intended for spam or unconfirmed messaging list
                purposes on our Products.
              </p>
              <p>
                This spam and unauthorised message activity policy applies to messages sent
                using our Products, or to messages sent from any network by the customer or
                any person on the customer&apos;s behalf, that directly or indirectly refer the
                recipient to a site hosted via our Products.
              </p>

              <h4>Unethical, exploitative, and malicious activity</h4>
              <p>
                Our Products must not be used for the purpose of advertising, transmitting or
                otherwise making available any software, program, product or service designed
                to violate this acceptable use policy, or the acceptable use policy of other
                service providers. This includes but isn&apos;t limited to facilitating the means
                to send spam and the initiation of network sniffing, pinging, packet spoofing,
                flooding, mail-bombing and denial-of-service attacks.
              </p>
              <p>
                Our Products must not be used to access any account or electronic resource
                where the group or individual attempting to gain access does not own or is not
                authorised to access the resource (e.g. &quot;hacking&quot;, &quot;cracking&quot;, &quot;phreaking&quot;,
                etc.).
              </p>
              <p>
                Our Products must not be used for the purpose of intentionally or recklessly
                introducing viruses or malicious code into our Products and systems.
              </p>
              <p>
                Our Products must not be used for purposely engaging in activities designed to
                harass another group or individual. Our definition of harassment includes but
                is not limited to denial-of-service attacks, hate-speech, advocacy of racial
                or ethnic intolerance, and any activity intended to threaten, abuse, infringe
                upon the rights of or discriminate against any group or individual.
              </p>
              <p>Other activities considered unethical, exploitative and malicious include:</p>
              <ul>
                <li>
                  Obtaining (or attempting to obtain) services from us with the intent to
                  avoid payment;
                </li>
                <li>
                  Using our facilities to obtain (or attempt to obtain) services from another
                  provider with the intent to avoid payment;
                </li>
                <li>
                  The unauthorised access, alteration or destruction (or any attempt thereof)
                  of any information about our customers or end-users, by any means or device;
                </li>
                <li>
                  Using our facilities to interfere with the use of our facilities and network
                  by other customers or authorised individuals;
                </li>
                <li>
                  Publishing or transmitting any content of links that incite violence, depict
                  a violent act, depict child pornography or threaten anyone&apos;s health and
                  safety;
                </li>
                <li>Any act or omission in violation of consumer protection laws and regulations;</li>
                <li>Any violation of a person&apos;s privacy.</li>
              </ul>
              <p>
                Our Products may not be used by any person or entity, which is involved with
                or suspected of involvement in activities or causes relating to illegal
                gambling; terrorism; narcotics trafficking; arms trafficking or the
                proliferation, development, design, manufacture, production, stockpiling, or
                use of nuclear, chemical or biological weapons, weapons of mass destruction,
                or missiles; in each case including any affiliation with others whatsoever who
                support the above such activities or causes.
              </p>

              <h4>Unauthorised use of Solve With Software Ltd property</h4>
              <p>
                We prohibit the impersonation of Solve With Software Ltd, the representation
                of a significant business relationship with Solve With Software Ltd, or
                ownership of any Solve With Software Ltd property (including our Products and
                brand) for the purpose of fraudulently gaining service, custom, patronage or
                user trust.
              </p>

              <h3>About this policy</h3>
              <p>
                This policy outlines a non-exclusive list of activities and intent we deem
                unacceptable and incompatible with our brand.
              </p>
              <p>
                We reserve the right to modify this policy at any time by publishing the
                revised version on our website. The revised version will be effective from the
                earlier of:
              </p>
              <ul>
                <li>
                  the date the customer uses our Products after we publish the revised version
                  on our website; or
                </li>
                <li>30 days after we publish the revised version on our website.</li>
              </ul>
            </section>

            {/* Disclaimer */}
            <section id="disclaimer">
              <h2>Disclaimer</h2>
              <p>
                Any information provided by Solve With Software Ltd on this website is for
                reference only. While we try to keep the information up to date and correct,
                we make no representations or warranties of any kind, express or implied,
                about the completeness, accuracy, reliability, suitability, or availability
                with respect to the website or any related services offered as part of this
                community. Any reliance you place on such information is therefore strictly at
                your own risk.
              </p>
            </section>

            {/* Project Work Terms & Conditions */}
            <section id="project-work-terms">
              <h2>Project Work Terms & Conditions</h2>
              <p>
                These Terms and Conditions apply to the provision of the services by Solve
                with Software Ltd, a company registered in England and Wales under number
                08200237 whose registered office is at North Colbea Business Centre to the
                person buying the services (you)
              </p>
              <p>
                You are deemed to have accepted these Terms and Conditions when you accept any
                quote (verbal or written) or commencement of services (whichever happens
                earlier) and these Terms and Conditions and our written or verbal quotation
                (the Contract) are the entire agreement between us.
              </p>
              <p>
                You acknowledge that you have not relied on any statement, promise or
                representation made or given by or on our behalf. These Conditions apply to
                the Contract to the exclusion of any other terms that you try to impose or
                incorporate, or which are implied by trade, custom, practice or course of
                dealing.
              </p>

              <h3>Interpretation</h3>
              <ul>
                <li>
                  A &quot;business day&quot; means any day other than a Saturday, Sunday or bank holiday
                  in England and Wales. Any work carried out on non-business days and
                  non-business hours are at the discretion of Solve With Software Ltd.
                </li>
                <li>
                  The headings in these Terms and Conditions are for convenience only and do
                  not affect their interpretation.
                </li>
                <li>Words imparting the singular number shall include the plural and vice versa.</li>
              </ul>

              <h3>Services</h3>
              <p>
                We warrant that we will use reasonable care and skill in our performance of
                the Services which will comply with the quotation, including any specification
                in all material respects. We can make any changes to the Services which are
                necessary to comply with any applicable law or safety requirement, and we will
                notify you if this is necessary.
              </p>
              <p>
                We will use our reasonable endeavours to complete the performance of the
                Services within the time agreed or as set out in the quotation; however, time
                shall not be of the essence in the performance of our obligations.
              </p>
              <p>
                All of these Terms and Conditions apply to the supply of any goods as well as
                Services unless we specify otherwise.
              </p>

              <h3>Your obligations</h3>
              <p>
                You must obtain any permissions, consents, licences or otherwise that we need
                and must give us access to any and all relevant information, materials,
                properties and any other matters which we need to provide the Services.
              </p>
              <p>If you do not comply with this clause, we can terminate the Services.</p>
              <p>
                We are not liable for any delay or failure to provide the Services if this is
                caused by your failure to comply with the provisions of this section (Your
                obligations).
              </p>

              <h3>Fees</h3>
              <p>
                The fees (Fees) for the Services are set out in the quotation or invoices for
                ongoing work.
              </p>
              <p>In addition to the Fees, we can recover from you:</p>
              <ul>
                <li>
                  reasonable incidental expenses including, but not limited to, travelling
                  expenses, hotel costs, subsistence, and any associated expenses,
                </li>
                <li>
                  the cost of services provided by third parties and required by us for the
                  performance of the Services as agreed beforehand, and
                </li>
                <li>
                  the cost of any materials required for the provision of the Services as
                  agreed beforehand.
                </li>
              </ul>
              <p>
                You must pay us for any additional services provided by us that are not
                specified in the quotation in accordance with our then current, applicable
                rate in effect at the time of performance or such other rate as may be agreed
                between us.
              </p>
              <p>
                The Fees will include any applicable VAT and other taxes or levies which are
                imposed or charged by any competent authority.
              </p>

              <h3>Cancellation and amendment</h3>
              <p>
                We can withdraw, cancel or amend a quotation if it has not been accepted by
                you, or if the Services have not started, within a period of 28 days from the
                date of the quotation, (unless the quotation has been withdrawn).
              </p>
              <p>
                Either we or you can cancel an order for any reason prior to your acceptance
                (or rejection) of the quotation.
              </p>
              <p>
                If you want to amend any details of the Services you must tell us in writing
                as soon as possible. We will use reasonable endeavours to make any required
                changes and additional costs will be included in the Fees and invoiced to you.
              </p>
              <p>
                If, due to circumstances beyond our control, including those set out in the
                clause below (Circumstances beyond a party&apos;s control), we have to make any
                change in the Services or how they are provided, we will notify you
                immediately. We will use reasonable endeavours to keep any such changes to a
                minimum.
              </p>

              <h3>Termination</h3>
              <p>
                We can terminate the provision of the Services immediately if you:
              </p>
              <ul>
                <li>commit a material breach of your obligations under these Terms and Conditions; or</li>
                <li>fail to make pay any amount due on the due date for payment; or</li>
                <li>
                  are or become or, in our reasonable opinion, are about to become, the
                  subject of a bankruptcy order or take advantage of any other statutory
                  provision for the relief of insolvent debtor; or
                </li>
                <li>
                  enter into a voluntary arrangement under Part 1 of the Insolvency Act 1986,
                  or any other scheme or arrangement is made with its creditors; or
                </li>
                <li>
                  convene any meeting of your creditors, enter into voluntary or compulsory
                  liquidation, have a receiver, manager, administrator or administrative
                  receiver appointed in respect of your assets or undertakings or any part of
                  them, any documents are filed with the court for the appointment of an
                  administrator in respect of you, notice of intention to appoint an
                  administrator is given by you or any of your directors or by a qualifying
                  floating charge holder (as defined in para. 14 of Schedule B1 of the
                  Insolvency Act 1986), a resolution is passed or petition presented to any
                  court for your winding up or for the granting of an administration order in
                  respect of you, or any proceedings are commenced relating to your insolvency
                  or possible insolvency.
                </li>
              </ul>

              <h3>Intellectual property</h3>
              <p>
                We reserve all agreed copyright and any other agreed intellectual property
                rights which may subsist in any goods supplied in connection with the
                provision of the Services. We reserve the right to take any appropriate action
                to restrain or prevent the infringement of such intellectual property rights.
              </p>

              <h3>Liability and indemnity</h3>
              <p>
                Our liability under these Terms and Conditions, and in breach of statutory
                duty, and in tort or misrepresentation or otherwise, shall be limited as set
                out in this clause.
              </p>
              <p>
                The total amount of our liability is limited to the total amount of Fees
                payable by you under the Contract.
              </p>
              <p>
                We are not liable (whether caused by our employees, agents or otherwise) in
                connection with our provision of the Services or the performance of any of our
                other obligations under these Terms and Conditions or the quotation for:
              </p>
              <ul>
                <li>any indirect, special or consequential loss, damage, costs, or expenses or;</li>
                <li>
                  any loss of profits; loss of anticipated profits; loss of business; loss of
                  data; loss of reputation or goodwill; business interruption; or, other
                  third-party claims; or
                </li>
                <li>
                  any failure to perform any of our obligations if such delay or failure is
                  due to any cause beyond our reasonable control; or
                </li>
                <li>
                  any losses caused directly or indirectly by any failure or your breach in
                  relation to your obligations; or
                </li>
                <li>
                  any losses arising directly or indirectly from the choice of Services and
                  how they will meet your requirements or your use of the Services or any
                  goods supplied in connection with the Services.
                </li>
              </ul>
              <p>
                You must indemnify us against all damages, costs, claims and expenses suffered
                by us arising from any loss or damage to any equipment (including that
                belonging to third parties) caused by you or your agents or employees.
              </p>
              <p>
                Nothing in these Terms and Conditions shall limit or exclude our liability for
                death or personal injury caused by our negligence, or for any fraudulent
                misrepresentation, or for any other matters for which it would be unlawful to
                exclude liability.
              </p>

              <h3>Data Protection</h3>
              <p>
                When supplying the Services to the Customer, the Service Provider may gain
                access to and/or acquire the ability to transfer, store or process personal
                data of employees of the Customer.
              </p>
              <p>
                The parties agree that where such processing of personal data takes place, the
                Customer shall be the &apos;data controller&apos; and the Service Provider shall be the
                &apos;data processor&apos; as defined in the General Data Protection Regulation (GDPR)
                as may be amended, extended and/or re-enacted from time to time.
              </p>
              <p>
                For the avoidance of doubt, &apos;Personal Data&apos;, &apos;Processing&apos;, &apos;Data Controller&apos;,
                &apos;Data Processor&apos; and &apos;Data Subject&apos; shall have the same meaning as in the
                GDPR.
              </p>
              <p>
                The Service Provider shall only Process Personal Data to the extent reasonably
                required to enable it to supply the Services as mentioned in these terms and
                conditions or as requested by and agreed with the Customer, shall not retain
                any Personal Data longer than necessary for the Processing and refrain from
                Processing any Personal Data for its own or for any third party&apos;s purposes.
              </p>
              <p>
                The Service Provider shall not disclose Personal Data to any third parties
                other than employees, directors, agents, sub-contractors or advisors on a
                strict &quot;need-to-know&quot; basis and only under the same (or more extensive)
                conditions as set out in these terms and conditions or to the extent required
                by applicable legislation and/or regulations.
              </p>
              <p>
                The Service Provider shall implement and maintain technical and organisational
                security measures as are required to protect Personal Data Processed by the
                Service Provider on behalf of the Customer.
              </p>
              <p>
                Further information about the Service Provider&apos;s approach to data protection
                are specified in its Data Protection Policy, which is available on request.
              </p>
              <p>
                For any enquiries or complaints regarding data privacy, you can contact at the
                following e-mail address:{" "}
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              </p>

              <h3>Circumstances beyond a party&apos;s control</h3>
              <p>
                Neither of us is liable for any failure or delay in performing our obligations
                where such failure or delay results from any cause that is beyond the
                reasonable control of that party. Such causes include, but are not limited to:
                power failure, critical illness, Internet Service Provider failure, industrial
                action, civil unrest, fire, flood, storms, earthquakes, acts of terrorism,
                acts of war, governmental action or any other event that is beyond the control
                of the party in question. If the delay continues for a period of 90 days,
                either of us may terminate or cancel the Services to be carried out under
                these Terms and Conditions.
              </p>

              <h3>Communications</h3>
              <p>
                All notices under these Terms and Conditions must be in writing and signed by,
                or on behalf of, the party giving notice (or a duly authorised officer of that
                party).
              </p>
              <p>Notices shall be deemed to have been duly given:</p>
              <ul>
                <li>
                  when delivered, if delivered by courier or other messenger (including
                  registered mail) during the normal business hours of the recipient;
                </li>
                <li>
                  when sent, if transmitted by fax or email and a successful transmission
                  report or return receipt is generated;
                </li>
                <li>on the fifth business day following mailing, if mailed by national ordinary mail; or</li>
                <li>on the tenth business day following mailing, if mailed by airmail.</li>
              </ul>
              <p>
                All notices under these Terms and Conditions must be addressed to the most
                recent address, email address or fax number notified to the other party.
              </p>
              <p>
                During online working meetings, calls may be recorded for project work
                purposes.
              </p>

              <h3>No waiver</h3>
              <p>
                No delay, act, or omission by a party in exercising any right or remedy will
                be deemed a waiver of that, or any other, right or remedy nor stop further
                exercise of any other right, or remedy.
              </p>

              <h3>Severance</h3>
              <p>
                If one or more of these Terms and Conditions is found to be unlawful, invalid,
                or otherwise unenforceable, that/those provisions will be deemed severed from
                the remainder of these Terms and Conditions (which will remain valid and
                enforceable).
              </p>

              <h3>Law and Jurisdiction</h3>
              <p>
                This Agreement shall be governed by and interpreted according to the law of
                England and Wales and all disputes arising from the Agreement (including
                non-contractual disputes and claims) shall be subject to the exclusive
                jurisdiction of the English and Welsh courts.
              </p>
            </section>

            {/* Contact Section */}
            <section className="mt-16 pt-8 border-t">
              <h2>Contact Us</h2>
              <p>
                If you have any questions about these terms, please contact us:
              </p>
              <ul>
                <li>
                  Email:{" "}
                  <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
                </li>
                <li>
                  Phone: <a href={`tel:${siteConfig.phone}`}>{siteConfig.phone}</a>
                </li>
              </ul>
              <p>
                For more information about how we handle your personal data, please see our{" "}
                <Link href="/privacy">Privacy Policy</Link>.
              </p>
            </section>
          </article>
        </Container>
      </main>
      <Footer categories={navCategories} />
    </>
  );
}
